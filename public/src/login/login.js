//GET HTML ELEMENTS

import loadconfirm, { redirect } from '../utility/utilities.js';
let text = document.getElementById('verif');
let radius = 600;


//GET LOCATION AND BOXES BEFORE THE REST OF THE APP IS LOADED

var options = {
    enableHighAccuracy: true,
    trackUserLocation: true,

};

export function success(pos) {
    let long = pos.coords.longitude;
    let lat = pos.coords.latitude;

    let userlocation = [long, lat]
    localStorage.setItem('userLong', long)
    localStorage.setItem('userLat', lat)
    console.log('items stored')

    spawnBox(userlocation);

}

export function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}


export function location() {
    navigator.geolocation.getCurrentPosition(success, error, options)
}

location();

mapboxgl.accessToken = 'pk.eyJ1IjoicnJ1aWlkZXYiLCJhIjoiY2t2N3FtMjFhMDFmNzJvbzdidnpkaGxweiJ9.R0WQ2KnHg8EQ9wyWPYLQFg';

export async function spawnBox(userlocation) {

    let box1 = randomGeo(userlocation, radius)
    console.log(box1)
    console.log(userlocation)
    let box2 = randomGeo(userlocation, radius)
    let box3 = randomGeo(userlocation, radius)

    if (localStorage.getItem('box1') == null) {
        localStorage.setItem('box1', JSON.stringify(box1))
        console.log("Spawned new boxes")

    } else {
        console.log("Read the boxes stored before")
    }

    if (localStorage.getItem('box2') == null) {
        localStorage.setItem('box2', JSON.stringify(box2))
    }

    if (localStorage.getItem('box3') == null) {
        localStorage.setItem('box3', JSON.stringify(box3))
    }


}

export function randomGeo(center, radius) {
    var y0 = center[0];
    var x0 = center[1];
    var rd = radius / 111300; //about 111300 meters in one degree

    var u = Math.random();
    var v = Math.random();

    var w = rd * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y = w * Math.sin(t);

    //Adjust the x-coordinate for the shrinking of the east-west distances
    var xp = x / Math.cos(y0);

    var newlat = y + y0;
    var newlon = x + x0;
    var newlon2 = xp + x0;

    return [parseFloat(newlat.toFixed(5)), parseFloat(newlon.toFixed(5))]

}

// LOGIN VALUES
let value

function getValue() {
    value = document.getElementById('login').value;
}

if (text) {
    value = text.addEventListener('click', getValue);
    console.log(value)
}

const fail = document.createElement('p')
let count = 0;
let status;
let id;
let g;

// API CALL TO THE REGISTERED USERS 

// prevent form from refreshing on click 

if (document.getElementById("form") & text) {
    var form = document.getElementById("form");
    function handleForm(event) { event.preventDefault(); }
    text.addEventListener('click', handleForm);
}




// get document elements

var container = document.getElementById('auth');
var body = document.getElementById('cont')


function startgame() {
    console.log('Success! you can start playing');
    window.location.href = '/html/game.html';

}

export default function loginSuccess() {
    value = document.getElementById('login').value;
    let t

    let data = { walletId: value };
    let URL = "https://api.kryptomon.co/egg-hunt/getUser.php";

    buttonclickhandler();

    function buttonclickhandler() {

        var SendInfo = JSON.stringify(data);
        console.log(SendInfo)

        $.post(URL, SendInfo, handledata)
    }

    function handledata(response) {
        g = JSON.parse(response)
        console.log(g)
        status = g.status;
        console.log(status);

        id = g.walletID;
        let boxes = g.boxes;
        console.log(boxes)
        let bLen = boxes.length;
        console.log(bLen)

        if (bLen == 0) {
            console.log('No more boxes, game ended')
            window.location.href = '/html/ongameend.html';
        } else {
            console.log('Game continues.')
        }

        console.log(`The registered User ID is ${id}`)

        if (status == 'listed') {

            if (localStorage.getItem('walletID') === null) {
                localStorage.setItem('walletID', id);
            }

            if (localStorage.getItem('boxIDs') === null) {
                localStorage.setItem('boxIDs', JSON.stringify(boxes));
            }

            container.style.animation = "fadeOut 1s";

            // add success form
            var success = document.createElement('p')
            var scontent = document.createTextNode('Success! Welcome to the hunt!');
            success.style.animation = 'fadeIn 1s';
            success.style.color = 'white';
            success.style.fontSize = '40px';

            container.remove();
            success.appendChild(scontent);
            body.appendChild(success);

            setTimeout(startgame, 2000);


        } else {
            // empty field
            clearInput();

            if (value.length == 0) {
                verif.style.animation = 'shake 1s'

            } else {
                count++
                console.log(count);
                if (count < 2) {
                    t = document.createTextNode('Authentication failed, try again.')
                }

                if (count > 2) {
                    t = document.createTextNode(' Are you sure you have a token?')
                }
            }

            fail.appendChild(t);
            fail.style.animation = 'fadeIn 1s'
            fail.style.fontFamily = 'Arial'
            fail.style.fontSize = '30px'
            fail.style.fontStyle = 'italic'
            fail.style.color = 'grey'
            fail.style.opacity = '50%'
            document.getElementById('auth').appendChild(fail)
            console.log('Get a token and come back')
        }

    }
}

function clearInput() {
    document.getElementById('login').value = "";
}

if (text){
    text.addEventListener('click', loginSuccess)
}


let button = document.getElementById('verif');

redirect();
loadconfirm();

if (button) {
    button.addEventListener('click', loginSuccess);
}
