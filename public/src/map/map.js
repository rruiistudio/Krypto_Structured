import mobileAndTabletCheck, { redirect } from '../utility/utilities.js';
import routetoggle from './ui.js';
import userlocation from './mapfunctions.js'; // import initial user location


//DECLARE VARIABLES
let long
let lat
let usermarker
let filter
let radiusLayer = 'radius'
let searchradius = 2;

let distA = [];
let elIndex;

let boxlist;



let playerID = localStorage.getItem('walletID');
console.log(playerID)


// initialize the boxstatus to be null 
function initialStatus() { 
        if (localStorage.getItem('box_status') == null) {
                let status = ['notFound', 'notFound', 'notFound']
                localStorage.setItem('box_status', JSON.stringify(status))
        }
}
initialStatus();

let boxstatus = JSON.parse(localStorage.getItem('box_status'));
console.log(boxstatus)



//--------------------------------------------------------------------------------------------------------------------//

// MAPBOX ACCESS TOKEN ----> THIS WILL HAVE TO BE REPLACED WITH A PAID VERSION OF MAPBOX
mapboxgl.accessToken = 'pk.eyJ1IjoicnJ1aWlkZXYiLCJhIjoiY2t2N3FtMjFhMDFmNzJvbzdidnpkaGxweiJ9.R0WQ2KnHg8EQ9wyWPYLQFg';

//--------------------------------------------------------------------------------------------------------------------//
mobileAndTabletCheck();
redirect();

//INITIALIZE MAP

// add a buffer --> on map load in here

console.log(userlocation)
export var map = setupMap([-2.24, 53.48]);
let user = marker(userlocation);


//INITIALIZE BOXES
storeBox(userlocation)
console.log(boxlist)

distA.push(calculateDistance(boxlist[0], userlocation),
        calculateDistance(boxlist[1], userlocation),
        calculateDistance(boxlist[2], userlocation)
);

export var closestItem = whichBox(boxlist, boxstatus, distA)
console.log(closestItem)

console.log(boxlist[closestItem])
console.log(boxlist)
mysterybox(boxlist[closestItem]);



//INTIALIZE ROUTE TO CLOSEST BOX
//---->route is always initialised to the closest available item

getRoute(userlocation, boxlist[closestItem]) // gets Initial route


// UTILITY FUNCTIONS

function initialFly() {
        navigator.geolocation.getCurrentPosition((position) => {
                map.flyTo({
                        center: [position.coords.longitude, position.coords.latitude],
                        zoom: 20,
                        speed: 1.5,
                        curve: 1,
                })


                let newlong = position.coords.longitude;
                let newlat = position.coords.latitude;
                let watchlocation = [long, lat]

        })
}


//-------------------------------------------------------------------------------------------------------------------//

function successLocation(position) {
        long = position.coords.longitude;
        lat = position.coords.latitude;

        let watchlocation = [long, lat]
        getRoute(watchlocation, boxlist[closestItem])
        let newdistance = calculateDistance(watchlocation, boxlist[closestItem])
        console.log(watchlocation)

        updateMarker(user, watchlocation);

        let filter = makeRadius(userlocation, searchradius);
        addData(map, radiusLayer, filter);
        console.log('watching location successfully')
        //replaceClass(boxstatus);
        unlockBox(newdistance, closestItem, boxstatus);

        return userlocation
}

function unlockBox(distance, closestItem, boxstatus) {
        if (distance < 200) {
                let m = document.getElementById('user');
                let b = document.getElementById('cont')
                m.classList.remove("marker");
                m.classList.add("closemarker");
                console.log('closer to the target!')


                // can add screen prompt here to show proximity
                /*

                let p = document.createElement('div')
                p.style.width = "100vw"; 
                p.style.height = "100vh"
                p.style.zIndex = 5; 
                p.style.alignItems = "center";
                p.style.flexDirection = "column";
                p.style.justifyContent = "center";
                p.style.fontSize = "40px";
                p.style.color = "white";

                p.innerHTML += '<p>You are getting closer!</p>';
                b.appendChild(p);
                */

                // -----> only append once, at the middle of the screen & destroy in 2 seconds

        }
        if (distance < 150) {
                let m = document.getElementById('user');
                m.classList.remove("closemarker");
                m.classList.add("closermarker");
                console.log('super close to the target!')
                // can add screen prompt here to show proximity
        }
        if (distance < 25) {
                console.log('box found, hooray!')
                convertInactive(boxstatus, closestItem);
                passboxfound(closestItem);
                window.location.href = '/html/boxfound.html';
        }
}

function convertInactive(list, index) {
                list[index] = 'found';
                console.log(index)
                console.log(list)
                localStorage.removeItem('box_status') // ---> in case it doesn't automatically override it
                localStorage.setItem('box_status', JSON.stringify(list));
                console.log('convert inactive function log')

                let el = document.getElementById('boxdiv');

                el.classList.remove('mark');
                el.classList.add('boxfound');
        return list
}
// TO FIX THIS ONE


function passboxfound(index) {
        var api_link = 'https://api.kryptomon.co/egg-hunt/openBox.php';
        var userID = localStorage.getItem('walletID')
        console.log(userID)
        var boxes = localStorage.getItem('boxIDs');
        var boxes = JSON.parse(boxes);
        var b = parseFloat(boxes[index].ID)
        console.log(boxes)
        var json = {
                walletID: userID,
                boxID: b
        }

        console.log(json)

        var SendInfo = JSON.stringify(json);
        $.post(api_link, SendInfo, handledata)

        function handledata(response) {
                let g = JSON.parse(response)
                console.log(g)
        }
}


function errorLocation() {
        map = setupMap([-2.24, 53.48]);
        map.flyTo({ center, zoom: 30 });
}

//-------------------------------------------------------------------------------------------------------------------//

// 1: CREATE A NEW MAP CONTAINER & PRE-SPECIFY ZOOM LEVEL 
function setupMap(center) {
        map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/rruiidev/ckv7qzrxu0fjk14ujmbfiy2vr',
                center: center,
                zoom: 0

        });

        return map;
}


// 2: ADD USER LOCATION DOT: 
function marker(center) {
        {
                // create a HTML element for each feature
                const el = document.createElement('div');
                el.id = 'user';
                el.className = 'marker';

                usermarker = new mapboxgl.Marker(el)
                        .setLngLat(center)
                        .addTo(map);
        }

        console.log('User location marker loaded succesfully')
        return usermarker;

}

// update user location dot

function updateMarker(marker, center) {
        marker.setLngLat(center)
        return marker;
}


//-------------------------------------------------------------------------------------------------------------------//

// 3: ADD MYSTERY BOXES: 

// you need to store the updated userlocation in a variable too actually

export async function spawnBox(userlocation) {
        var point = [userlocation[0], userlocation[1]]
        const limit = 3;
        const radius = 1500; // in meters
        const tileset = "mapbox.mapbox-streets-v8";
        const layers = ['place_label'];
        const query = await fetch(
                `https://api.mapbox.com/v4/${tileset}/tilequery/${point[0]},${point[1]}.json?radius=${radius}&limit=${limit}&layers=${layers}&access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
        );
        const json = await query.json();
    
        // add to map: 


        console.log(json)

        if (localStorage.getItem('box1') == null) {
                localStorage.setItem('box1', json.features[0].geometry.coordinates)
        }

        if (localStorage.getItem('box2') == null) {
                localStorage.setItem('box2', json.features[1].geometry.coordinates)
        }

        if (localStorage.getItem('box3') == null) {
                localStorage.setItem('box3', json.features[2].geometry.coordinates)
        }

        return json;

}


function storeBox(userlocation) {
        spawnBox(userlocation);
        let box1 = localStorage.getItem('box1');
        box1 = box1.split(',')
        box1 = [parseFloat(box1[0]), parseFloat(box1[1])]

        let box2 = localStorage.getItem('box2');
        box2 = box2.split(',')
        box2 = [parseFloat(box2[0]), parseFloat(box2[1])]

        let box3 = localStorage.getItem('box3');
        box3 = box3.split(',')
        box3 = [parseFloat(box3[0]), parseFloat(box3[1])]

        boxlist = [box1, box2, box3];
        console.log('item retrieved');

        return boxlist
}

//TO TEST ALL OF THIS 

// only load markers for one box at a time
function mysterybox(element) {
                const el = document.createElement('div');
                el.classList.add('mark');
                el.id = "boxdiv";

                new mapboxgl.Marker(el)
                        .setLngLat(element)
                        .setPopup(
                                new mapboxgl.Popup({ offset: 25 }) // add popups
                                        .setHTML(
                                                `<img id="mysterybox" src = "../images/Box_Closed.png" width="50px">
                                <h3 style = "font-size: 12px; margin-top: -10%;" >Mysterybox</h3><p style = "font-size: 11px; margin-top: -11%">${calculateDistance(element, userlocation)} m away</p>
                                <style >`
                                        )
                        )
                        .addTo(map);

        return elIndex, distA;

}

function calculateDistance(data, location) {

        var from = turf.point(location);
        var to = turf.point(data);

        var options = { units: 'meters' };
        var distance = Math.round(turf.distance(from, to, options));
        return distance;

}

function whichBox(list, status, distances){
        let availableb = []
        list.forEach(box => {
                let i= list.indexOf(box)
                if (status[i] == 'notFound') {
                        let bdist= calculateDistance(box, userlocation);
                        availableb.push(bdist);
                        console.log(availableb)

                return availableb
                }
        }) 

        const min = Math.min(...availableb);
        let index = distances.indexOf(min);
        console.log(index)
        return index
}


// add box functions 

function makeRadius(lngLatArray, radiusInMeters) {
        var point = turf.point(lngLatArray);
        var buffered = turf.buffer(point, radiusInMeters, { units: 'kilometers' });

        return buffered;
}


// 4: GENERATE DIRECTIONS BETWEEN USER LOCATION & CLICKED BOX

// A: create a function to make a directions request
async function getRoute(start, end) {
        const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
        );

        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry.coordinates;


        const geojson = {
                type: 'Feature',
                properties: {},
                geometry: {
                        type: 'LineString',
                        coordinates: route
                }
        };


        // if the route already exists on the map, we'll reset it using setData

        async function toggleView() {
                //console.log(routetoggle)
                if (routetoggle == false) {
                        if (map.getSource('route')) {
                                map.getSource('route').setData(geojson);
                        }
                        // otherwise, we'll make a new request
                        else {
                                map.addLayer({
                                        id: 'route',
                                        type: 'line',
                                        source: {
                                                type: 'geojson',
                                                data: geojson
                                        },
                                        layout: {
                                                'line-join': 'round',
                                                'line-cap': 'round'
                                        },
                                        paint: {
                                                'line-color': '#3887be',
                                                'line-width': 10,
                                                'line-opacity': 0.75
                                        }
                                });
                        }
                }

                // turn instructions here?
                navDirections(data);
        }
        toggleView();
}


async function navDirections(data) {
        const instructions = document.getElementById('textarea');
        const steps = data.legs[0].steps;

        let tripInstructions = '';
        for (const step of steps) {
                tripInstructions += `<li>${step.maneuver.instruction}</li>`;
        }
        instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
                data.duration / 60
        )} min </strong></p><ol>${tripInstructions}</ol>`;

}



// GET USER LOCATION ON CLICK 

function addInfo(map, id, data, color) {
        map.addLayer({
                id: id,
                source: {
                        type: 'geojson',
                        data: data
                },
                type: 'fill',
                paint: {
                        'fill-color': color,
                        'fill-opacity': 0.1
                }
        });
}

function addData(map, layer, data) {
        map.getSource(layer).setData(data);

}

export default function approvelocation(counter) {
        console.log("this is from the approvelocation function")
        if (counter == 0) {
                updateLocation();
                addInfo(map, 'radius', filter, 'white');
                const watchID = navigator.geolocation.watchPosition(successLocation, errorLocation,
                        {
                                enableHighAccuracy: true,
                                trackUserLocation: true,
                                showUserHeading: true
                        })
                console.log(user)
                return watchID;
        }

}

export function updateLocation() {
        let newlocation = initialFly();
        return newlocation

}










