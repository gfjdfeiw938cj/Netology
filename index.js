

const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;  
const app = express();
const jsonParser = express.json();
const multer = require('multer');
let fs = require('fs-extra');

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true , capped : true, size:4000, max : 1 });

let random16 = Math.floor(Math.random()*16777215).toString(16);

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
            let path = "C:\\Users\\user\\Desktop\\test";
            fs.mkdirsSync(path);
            cb(null, path);
    },
    filename: (req, file, cb) =>{
        cb(null, random16 + ".txt");
    },
    
});

app.use(multer({storage:storageConfig, limits:{ files: 1,fileSize: 100000 },}).single("filedata"));

app.use(express.static(__dirname));

mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("usersdb").collection("users");
    app.listen(3000, function () {
        console.log('Сервер был запушен !')
    });
});
app.get("/users", function(req, res){
        
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, users){
         
        if(err) return console.log(err);
        res.send(users)
    });  
});
let dbClient;
app.get("/users/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, user){
               
        if(err) return console.log(err);
        res.send(user);
    });
});

app.post("/users", jsonParser, function (req, res) {

    const file = req.file
    console.log(file)
   
    const collection = req.app.locals.collection;
    const files = {name: file.fieldname, value:file.path, data:+Date.now()};
    collection.insertOne(files, function(err, result){
               
        if(err) return console.log(err);
        if(!file){
        res.send("Ошибка при загрузке файла");
        }
        else
        res.send(files);     
    })
});
   
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
//--------------------------------------------------------------------
 