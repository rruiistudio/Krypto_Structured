let div
let logosrc = "../images/kLogo.png";

function createscreen(){
    const div = document.createElement('div'); 
    const loaddiv = document.createElement('div'); 
    const logo = document.createElement('img');

    logo.src = "../images/Loading_Screen.jpg";
    logo.style.width = "100%"
    logo.style.height = "107%"
    logo.style.marginTop= "-5%"
    logo.style.position = "absolute"
    logo.style.zIndex = "0"
    
    div.style.width= "100vw"; 
    div.style.height = "100vh"; 
    div.style.zIndex = "3";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.display = "flex";
    div.style.position= "absolute";
    

    loaddiv.style.width= "100vw"; 
    loaddiv.style.display= "flex";
    loaddiv.style.position= "absolute";
    loaddiv.style.height = "100vh";
    loaddiv.style.zIndex = "5"; ;
    loaddiv.style.alignItems = "center";
    loaddiv.style.justifyContent = "center";
    loaddiv.innerHTML = "Loading...";
    loaddiv.style.color = "white";
    loaddiv.style.fontFamily= "mister-london";
    loaddiv.style.fontSize = "50px"


    div.appendChild(logo); 

    console.log('this function ran')
    document.getElementById("cont").appendChild(div); 

    return div
}

function destroyscreen(){
    div.style.animation = "fadeOut 2s";
    div.remove()
}

function splashScreen(){
    document.addEventListener('load', createscreen)
}

div = createscreen(); 

setTimeout(destroyscreen, 3000);
