import mobileAndTabletCheck, { redirect } from '../utility/utilities.js';
import routetoggle from './ui.js';
//import userlocation from './mapfunctions.js'; // import initial user location
import location from './mapfunctions.js';


//DECLARE VARIABLES
let long
let lat
let usermarker
let filter
let coords
let radiusLayer = 'radius'
let searchradius = 2;

let distA = [];
let elIndex;
let boxlist;


//location();
let playerID = localStorage.getItem('walletID');
console.log(playerID)

//localStorage.removeItem('box_status')
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
coords = [localStorage.getItem('userLong'), localStorage.getItem('userLat')]
console.log('items retrieved')
let userlocation = [parseFloat(coords[0]), parseFloat(coords[1])];

console.log(userlocation)
export var map = setupMap([-2.24, 53.48]);
let user = marker(userlocation);


//INITIALIZE BOXES

boxlist = storeBox()
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
        console.log(position)
        long = position.coords.longitude;
        lat = position.coords.latitude;
        let heading = position.coords.heading;

        console.log(heading)

        let watchlocation = [long, lat]
        getRoute(watchlocation, boxlist[closestItem])
        let newdistance = calculateDistance(watchlocation, boxlist[closestItem])
        console.log(watchlocation)

        let center = [((watchlocation[0] + boxlist[closestItem][0]) / 2), ((watchlocation[1] + boxlist[closestItem][1]) / 2)]
        console.log(center)

        updateMarker(user, watchlocation);

        let filter = makeRadius(userlocation, searchradius);
        addData(map, radiusLayer, filter);
        console.log('watching location successfully')
        //replaceClass(boxstatus);
        unlockBox(newdistance, closestItem, boxstatus);

        let zoomin = document.getElementById('zoomin')
        let zoomout = document.getElementById('zoomout')

        let isMoving = map.isMoving();
        console.log(isMoving)

        if (isMoving == false) {
                moveControls();
                
        } else {
                setTimeout(moveControls, 5000)
        }

        function moveControls(){
                if (!heading == null) {
                        map.flyTo({
                                center: userlocation,
                                zoom: 20,
                                bearing: heading
                        })
        
                } else {
                        let bearing = turf.bearing(watchlocation, boxlist[closestItem])
                        map.flyTo({
                                center: userlocation,
                                zoom: 20,
                                bearing: bearing
                        })
                }
        }

        zoomin.addEventListener('click', onzoomin)
        zoomout.addEventListener('click', onzoomout)

        function onzoomin() {
                console.log('ive definitely zoomedin on that one')
                map.flyTo({
                        center: userlocation,
                        zoom: 25
                })

        }

        function onzoomout() {
                console.log('deeeefintely zooming out now')
                map.flyTo({
                        center: center,
                        zoom: 15
                })
        }



        return userlocation
}

function unlockBox(distance, closestItem, boxstatus) {
        if (distance < 250) {
                let m = document.getElementById('user');
                let b = document.getElementById('cont')
                m.classList.remove("marker");
                m.classList.add("closemarker");
                console.log('Closer to the target!')
        }
        if (distance < 150) {
                let m = document.getElementById('user');
                m.classList.remove("closemarker");
                m.classList.add("closermarker");
                console.log('Super close to the target!')
                // can add screen prompt here to show proximity
        }
        if (distance < 25) {
                console.log('Box found, hooray!')
                convertInactive(boxstatus, closestItem);
                passboxfound(); // change this to nothing in case the box 
                window.location.href = '/html/unlockbox.html';
        }
}

function convertInactive(list, index) {
        list[index] = 'found';
        console.log(index)
        console.log(list)
        localStorage.removeItem('box_status') // ---> in case it doesn't automatically override it
        localStorage.setItem('box_status', JSON.stringify(list));
        console.log(`Box number ${index} has been converted inactive`)

        let el = document.getElementById('boxdiv');
        el.classList.add('boxfound');
        return list
}
// TO FIX THIS ONE
// change this to index 0 if the boxes are being removed from the API call every time.
function passboxfound() {
        let URL = "https://api.kryptomon.co/egg-hunt/getUser.php";
        var api_link = 'https://api.kryptomon.co/egg-hunt/openBox.php';
        var userID = localStorage.getItem('walletID')
        console.log(userID)

        // make a call to the current API every time to only get the boxes available
        buttonclickhandler();

        function buttonclickhandler() {
                var getInfo = JSON.stringify(data);
                console.log(getInfo)

                $.post(URL, getInfo, handleboxes)
        }

        function handleboxes(response) {
                g = JSON.parse(response)
                console.log(g)
                let boxes = g.boxes;
                var b = parseFloat(boxes[0].ID);
                console.log(b)

                var json = {
                        walletID: userID,
                        boxID: b
                }

                console.log(json)

                var SendInfo = JSON.stringify(json);
                $.post(api_link, SendInfo, handledata)
        }

        function handledata(res) {
                let g = JSON.parse(res)
        
                if (g == 'success') {
                        console.log(`Successfully passed ${b} as unlocked belonging to user ${userID}`)
                } else {
                        console.log('There was an error passing the box to the API')
                }
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

/*
export async function spawnBox(userlocation) {
        console.log("the spawn box function is running")
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
    
      
        console.log(json)

        if (localStorage.getItem('box1') == null) {
                let b = localStorage.setItem('box1', json.features[0].geometry.coordinates)
                console.log(b);

        }

        if (localStorage.getItem('box2') == null) {
                localStorage.setItem('box2', json.features[1].geometry.coordinates)
        }

        if (localStorage.getItem('box3') == null) {
                localStorage.setItem('box3', json.features[2].geometry.coordinates)
        }

        return json;

}
*/


function storeBox() {
        console.log("the store box function is ok")
        //spawnBox(userlocation);
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

export function calculateDistance(data, location) {

        var from = turf.point(location);
        var to = turf.point(data);

        var options = { units: 'meters' };
        var distance = Math.round(turf.distance(from, to, options));
        return distance;

}

function whichBox(list, status, distances) {
        let availableb = []
        list.forEach(box => {
                let i = list.indexOf(box)
                if (status[i] == 'notFound') {
                        let bdist = calculateDistance(box, userlocation);
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

export default function approvelocation(counter, no) {
        console.log("this is from the approvelocation function")
        if (counter == no) {
                //updateLocation();
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










