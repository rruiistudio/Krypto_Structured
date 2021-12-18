let div
let logosrc = "../images/loadIcon.png";

function createscreen(){
    const div = document.createElement('div'); 
    const logo = document.createElement('img');
    logo.src = logosrc;
    logo.style.width = "100%";
    logo.style.opacity = "20%"
    logo.style.animation = "spin 2s infinite";
    
    div.style.width= "100vw"; 
    div.style.height = "100vh"; 
    div.style.backgroundColor = "#160b21"; 
    div.style.zIndex = "10";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.display = "flex";
    div.style.position = "absolute"; 
    div.style.top = "0"; 
    div.style.left = "0";


    div.appendChild(logo); 

    console.log('Loading screen completed')
    document.getElementById('cont').appendChild(div); 

    return div
}

function destroyscreen(){
    div.style.animation = "fadeOut 1s";
    div.style.zIndex = "-1";
    div.remove(); 
}

function splashScreen(){
    document.addEventListener('load', createscreen)
}

div = createscreen(); 
setTimeout(destroyscreen, 500);
