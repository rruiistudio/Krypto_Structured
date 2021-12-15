let div
let logosrc = "/dist/images/kLogo.png";

function createscreen(){
    const div = document.createElement('div'); 
    const logo = document.createElement('img');
    logo.src = logosrc;
    logo.style.animation = "logoSpin 2s";
    logo.style.width = "20%"
    
    div.style.width= "100vw"; 
    div.style.height = "100vh"; 
    div.style.backgroundColor = "black"; 
    div.style.zIndex = "10";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.display = "flex";


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
