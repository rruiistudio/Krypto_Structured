import closestItem from '/scripts/map/map.js'

let div = document.getElementById('container')
let readvalue

function read(closestItem){
    let text = JSON.parse(localStorage.getItem('boxesMsg'));
    text = text[closestItem];

    return text;

}

readvalue = read(closestItem);
div.innerHTML = `${readvalue}`