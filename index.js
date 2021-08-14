
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;  
const app = express();
const jsonParser = express.json();
const multer = require('multer');
let fs = require('fs-extra');
const path = require('path')

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true , capped : true, size:4000, max : 1 });

const storageConfig = multer.diskStorage({

    destination: (req, file, cb) =>{
            let path = "C:\\Users\\user\\Desktop\\test";
            fs.mkdirsSync(path);
            cb(null, path);
    },
    filename: (req, file, cb) =>{
            let random16 = Math.floor(Math.random()*1677721532234532).toString(16)
            cb(null, Date.now() + '-' + random16 + path.extname(file.originalname));    
    },
});

app.use(multer({storage:storageConfig, limits:{ files: 5,fileSize: 100000 },}).any());

app.use(express.static(__dirname));

mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("usersdb").collection("users");
    app.listen(3000, function () {
        console.log('Сервер был запушен !')
    });
});
app.get("/files", function(req, res){
        
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, users){
         
        if(err) return console.log(err);
        res.send(users)
    });  
});
let dbClient;
app.get("/files/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, user){
               
        if(err) return console.log(err);
        res.send(user);
    });
});

app.post("/files", jsonParser, function (req, res) {

    const files = req.files
    console.log(files)
    const collection = req.app.locals.collection;

    let usersMapped = files.map(function(el) {
        return({fullName: el.fieldname,
                path: el.path,
                data: new Date().toLocaleString(),
                size: el.size
            })
      });
     
    collection.insertMany(usersMapped, function(err, result){
               
        if(err) return console.log(err);
        if(!usersMapped){
        res.send("Ошибка при загрузке файла");
        }
        else
        res.send(usersMapped);     
    })
});
   
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});

 