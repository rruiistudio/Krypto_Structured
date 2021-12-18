//GET HTML ELEMENTS

import loadconfirm, { redirect } from '../utility/utilities.js';
//import location from '../map/mapfunctions.js';
let text = document.getElementById('verif');
import { calculateDistance } from '../map/mapfunctions.js';


//GET LOCATION AND BOXES BEFORE THE REST OF THE APP IS LOADED
// except for the initial location function, the spawn box function can be potentially moved back into map.js

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
    var point = [userlocation[0], userlocation[1]]
    const limit = 48;
    const radius = 5000; // in meters
    const tileset = "mapbox.mapbox-streets-v8";
    const layers = ['place_label', 'poi_label'];
    const query = await fetch(
            `https://api.mapbox.com/v4/${tileset}/tilequery/${point[0]},${point[1]}.json?radius=${radius}&limit=${limit}&layers=${layers}&access_token=${mapboxgl.accessToken}`,
            { method: 'GET' }
    );
    const json = await query.json();

    console.log(json)

    let jsoncoords = []

    jsoncoords = getCoords(json, jsoncoords)
    console.log(jsoncoords)

    function getCoords(list, array) {
        list.features.forEach(el => {
            let c = el.geometry.coordinates
            let f = [c[0], c[1]]
            array.push(f)
            return array
        })
        return array
    }
    

    let selected = []
    console.log(userlocation)
    let distance = []
    jsoncoords.forEach(el => {
        let v = calculateDistance(userlocation, el)
        distance.push(v)
        boxproximity(distance, selected, jsoncoords)
        return distance
    })

    console.log(distance)
   

    selected = selected.slice(Math.max(selected.length - 3, 0))
    console.log(selected[0])



    function boxproximity(list, array, coords) {
        list.forEach(el => {
            let i = list.indexOf(el);
            let newitem = coords[i]
            if (el > 200 & !array.includes(newitem)) {
                array.push(newitem);
            }

            return array
        })
    }

  
    console.log(json)

   // localStorage.removeItem('box_found')

//    localStorage.removeItem('box1')
  //  localStorage.removeItem('box2')
   // localStorage.removeItem('box3')

    if (localStorage.getItem('box1') == null) {
            localStorage.setItem('box1', selected[0])
            console.log("Spawned new boxes")

    } else {
        console.log("Read the boxes stored before")
    }

    if (localStorage.getItem('box2') == null) {
            localStorage.setItem('box2', selected[1])
    }

    if (localStorage.getItem('box3') == null) {
            localStorage.setItem('box3', selected[2])
    }

    return json;

}

// LOGIN VALUES

function getValue() {
    value = document.getElementById('login').value;
}

let value = text.addEventListener('click', getValue);
console.log(value)
const fail = document.createElement('p')
let count = 0;
let status;
let id;
let boxesId;
let g;

// API CALL TO THE REGISTERED USERS 

// prevent form from refreshing on click 
var form = document.getElementById("form");
function handleForm(event) { event.preventDefault(); }
text.addEventListener('click', handleForm);


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
        } else {
            console.log('Game continues.')
        }

        console.log(id)
    
        if (status == 'listed') {
            console.log('did something')

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

            setTimeout(startgame, 3000);


        } else {
            // empty field
            clearInput();
    
            if (value.length == 0) {
                console.log('this is not ok')
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

text.addEventListener('click', loginSuccess)

let button = document.getElementById('verif');

redirect();
loadconfirm();
button.addEventListener('click',  loginSuccess);