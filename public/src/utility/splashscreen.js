import countdown from '../utility/countdown.js'

let div
// preload images
let btn = '../images/nexthunt_button.png';
let klg = '../images/krypto_logo_new.png';
let ws = "../images/welcome_screen.png";
let bkg = '../images/win_background.png'

function createscreen(){

    
    const div = document.createElement('div'); 
    const logo = document.createElement('img');
    const back = document.createElement('img')
    const p = document.createElement('div');
    const v = document.createElement('div');
    const loadbar = document.createElement('div');
    const loading = document.createElement('div');
    const l = document.createElement('img');
    const b = document.createElement('img');
    const c = document.createElement('div');

    countdown(c)

    c.style.fontSize = '40px';
    c.style.paddingTop = '3vh';

    b.src = btn
    b.style.paddingTop = '3vh'

    l.src = klg
    l.style.paddingBottom = '5vh'
    l.style.marginTop = '-10vh';

    p.innerHTML = "TREASURE HUNT";
    p.style.fontSize = "120px";
    p.style.zIndex = "2";
    p.style.paddingLeft = "5vw";
    p.style.paddingRight = "5vw";
    p.style.textAlign = "center";
    v.innerHTML = "LOADING...";
    v.style.fontSize = "40px";
    v.style.paddingBottom = '3vh';

    loadbar.style.backgroundColor = 'grey';
    loadbar.style.borderRadius = '10px';
    loadbar.style.opacity = '100%';
    loadbar.style.height = '2vh';
    loadbar.style.width = '60vw';
    loadbar.style.alignContent = 'center';
    loadbar.style.justifyContent = 'center';

    loading.style.backgroundColor = 'white';
    loading.style.borderRadius = '10px';
    loading.style.opacity = '100%';
    loading.style.height = '2vh';
    loading.style.width = '60vw';
    loading.style.animation = "load 9s";
    loading.style.zIndex = '2';
    loading.style.position = 'relative';
    loading.style.left = '0';
    loading.style.top = '0';
    loading.style.bottom = '0';

    loadbar.appendChild(loading)
    

    logo.src = ws
    logo.style.width = "100%"
    logo.style.height = "auto"
    logo.style.zIndex = "0"
    logo.style.marginTop = "-15vh"
    logo.style.paddingBottom = '3vh'
    
    div.style.width= "100vw"; 
    div.style.color = "white";
    div.style.backgroundColor = 'black';
    div.style.height = "100vh"; 
    div.style.zIndex = "1";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.position= "absolute";

    back.src = bkg
    back.style.position = 'fixed'
    back.style.width = '200%'
    back.style.height = 'auto'
    back.style.top = '0'
    back.style.zIndex = '-1'


    div.appendChild(back)
    div.appendChild(l)
    div.appendChild(p)
    div.appendChild(logo); 
    div.appendChild(v)
    div.appendChild(loadbar)
    div.appendChild(b)
    div.appendChild(c)
    
    

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

setTimeout(destroyscreen, 9500);
