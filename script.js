
(function () {
    const closingBtn = document.querySelector('.popup-close-button');
    const popup = document.querySelector('.popup');
  

    closingBtn.addEventListener("click",() => {
      popup.classList.add('popup-hidden'); 
    })
     
    setTimeout(() => {popup.classList.remove('popup-hidden')}, 3000)
}())

