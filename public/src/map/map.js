import mobileAndTabletCheck, { redirect } from '../utility/utilities.js';
import routetoggle from './ui.js';


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
let found;

let watchlocation;
let popupID;


let playerID = localStorage.getItem('walletID');
console.log(`User walled id retrieved from storage: ${playerID}`)

function initialStatus() {
        if (localStorage.getItem('box_status') == null) {
                let status = ['notFound', 'notFound', 'notFound']
                localStorage.setItem('box_status', JSON.stringify(status))
        }
}
initialStatus();

let boxstatus = JSON.parse(localStorage.getItem('box_status'));
console.log(`Box status retrieved from storage: ${boxstatus}`)

//--------------------------------------------------------------------------------------------------------------------//

// MAPBOX ACCESS TOKEN ----> THIS WILL HAVE TO BE REPLACED WITH A PAID VERSION OF MAPBOX
mapboxgl.accessToken = 'pk.eyJ1IjoicnJ1aWlkZXYiLCJhIjoiY2t2N3FtMjFhMDFmNzJvbzdidnpkaGxweiJ9.R0WQ2KnHg8EQ9wyWPYLQFg';

//--------------------------------------------------------------------------------------------------------------------//
mobileAndTabletCheck();
redirect();

//INITIALIZE MAP

// add a buffer --> on map load in here
coords = [localStorage.getItem('userLong'), localStorage.getItem('userLat')]
let userlocation = [parseFloat(coords[0]), parseFloat(coords[1])];
console.log(`User location retrieved from storage: ${userlocation}`)

export var map = setupMap([-2.24, 53.48]);
let user = marker(userlocation);


//INITIALIZE BOXES

boxlist = storeBox()

distA.push(calculateDistance(boxlist[0], userlocation),
        calculateDistance(boxlist[1], userlocation),
        calculateDistance(boxlist[2], userlocation)
);

export var closestItem = whichBox(boxlist, boxstatus, distA)

console.log(`The spawned boxes are ${boxlist}`)
console.log(`The generated route is towards are ${boxlist[closestItem]}`)
mysterybox(boxlist[closestItem]);



//INTIALIZE ROUTE TO CLOSEST BOX
//---->route is always initialised to the closest available item

getRoute(userlocation, boxlist[closestItem]) // gets Initial route


// UTILITY FUNCTIONS
//redundant function
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
        let heading = position.coords.heading;

        let accuracy = position.coords.accuracy;
        console.log(`The current tracking accuracy is ${accuracy}`)
        watchlocation = [long, lat]
        console.log(`The user current location is ${watchlocation}`)

        updateMarker(user, watchlocation);
        getRoute(watchlocation, boxlist[closestItem]);


        let newdistance = calculateDistance(watchlocation, boxlist[closestItem])
        updateboxdistance(newdistance);
        


        let center = [((watchlocation[0] + boxlist[closestItem][0]) / 2), ((watchlocation[1] + boxlist[closestItem][1]) / 2)]
        console.log(`The middle of the route is ${center}`)

        let filter = makeRadius(userlocation, searchradius);
        addData(map, radiusLayer, filter);
        unlockBox(newdistance, closestItem, boxstatus);
        let bearing = turf.bearing(watchlocation, boxlist[closestItem])

        let orientation
        orientation = getHeading();
        console.log(`The user direction is ${orientation}`)

        let isMoving = map.isMoving();
        let stopfly = false;
        console.log(`Map touch events status ${isMoving}`)

        if (isMoving == false) {
                stopfly = false
                moveControls();
        }

        if (isMoving == true) {
                stopfly = true;
        }


        function getHeading() {
                if (heading == null) {
                        orientation = bearing;
                } else {
                        orientation = heading;
                }
                return orientation
        }


        function moveControls() {
                if (stopfly == false) {

                        map.flyTo({
                                center: watchlocation,
                                zoom: 20,
                                bearing: orientation
                        })
                }
        }

        if (document.body.contains(document.getElementById('zoomin'))) {
                let zoomin = document.getElementById('zoomin')
                zoomin.addEventListener('click', onzoomin)

        }

        if (document.body.contains(document.getElementById('zoomout'))) {
                let zoomout = document.getElementById('zoomout')
                zoomout.addEventListener('click', onzoomout)

        }

        function onzoomin() {
                console.log('Zooming in')
                map.flyTo({
                        center: watchlocation,
                        zoom: 22,
                        bearing: orientation
                })

                stopfly = false;
        }

        function onzoomout() {
                stopfly = true;
                console.log('Zooming out')
                map.flyTo({
                        center: center,
                        zoom: 15,
                        bearing: orientation
                })

        }

        return watchlocation
}

function updateboxdistance(text) {
        if (document.getElementById('boxdist')) {
                document.getElementById('boxdist').innerHTML = `${text} m away`;
                console.log(`The current distance to the box is ${text}`)
        }
}

function unlockBox(distance, closestItem, boxstatus) {
        if (distance < 250) {
                let m = document.getElementById('user');
                m.classList.remove("marker");
                m.classList.add("closemarker");
                console.log('Getting closer to the target!')
        }
        if (distance < 150) {
                let m = document.getElementById('user');
                m.classList.remove("closemarker");
                m.classList.add("closermarker");
                console.log('Getting very close to the target!')
        }
        if (distance < 25) {
                console.log('Box found, hooray!')
                passboxfound();
                convertInactive(boxstatus, closestItem);
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

// change this to index 0 if the boxes are being removed from the API call every time.
function passboxfound() {
        let URL = "https://api.kryptomon.co/egg-hunt/getUser.php";
        var api_link = 'https://api.kryptomon.co/egg-hunt/openBox.php';
        var userID = localStorage.getItem('walletID')
        let data = { walletId: userID };
        console.log(userID)

        // make a call to the current API every time to only get the boxes available
        buttonclickhandler(data);

        function buttonclickhandler(data) {
                var getInfo = JSON.stringify(data);
                console.log(getInfo)
                $.post(URL, getInfo, handleboxes)
        }

        function handleboxes(response) {
                let g = JSON.parse(response)
                console.log(g)
                let boxes = g.boxes;
                console.log(boxes)
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
                console.log(g)
                found = true;
                if (g == 'success') {
                        console.log(`Successfully passed ${b} as unlocked belonging to user ${userID}`)
                        return found

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

function storeBox() {
        let box1 = localStorage.getItem('box1');
        if(box1!==null){
                box1 = box1.split(',')
                box1 = [parseFloat(box1[0]), parseFloat(box1[1])]
        } else {
                console.log('Boxes could not be found- game started without')
        }

        let box2 = localStorage.getItem('box2');
        if(box2!==null){
                box2 = box2.split(',')
                box2 = [parseFloat(box2[0]), parseFloat(box2[1])]
        }

        let box3 = localStorage.getItem('box3');
        //box3 = box3.split(',')
        if(box3!==null){
                box3 = box3.split(',')
                box3 = [parseFloat(box3[0]), parseFloat(box3[1])]
        }

        boxlist = [box1, box2, box3];
        console.log('Box locations retrieved from local storage');

        return boxlist
}


// only load markers for one box at a time
function mysterybox(element) {
        const el = document.createElement('div');
        el.classList.add('mark');
        el.id = "boxdiv";

        let currentdistance

        if (typeof watchlocation === 'undefined') {
                currentdistance = calculateDistance(element, userlocation)
        } else {
                currentdistance = calculateDistance(element, watchlocation)
        }

        new mapboxgl.Marker(el)
                .setLngLat(element)
                .setPopup(
                        new mapboxgl.Popup({ offset: 25 }) // add popups
                                .setHTML(
                                        `<img id="mysterybox" src = "../images/Box_Closed.png" width="50px">
                                <h3 style = "font-size: 12px; margin-top: -10%;" >Mysterybox</h3><p id = "boxdist"; style = "font-size: 11px; margin-top: -11%">${currentdistance} m away</p>
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

                        return availableb
                }
        })

        const min = Math.min(...availableb);
        let index = distances.indexOf(min);
        console.log(`Spawning box with index: ${index}`)
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
        console.log("Watch location has been approved.")
        if (counter == no) {
                addInfo(map, 'radius', filter, 'white');
                const watchID = navigator.geolocation.watchPosition(successLocation, errorLocation,
                        {
                                enableHighAccuracy: true,
                                trackUserLocation: true,
                                showUserHeading: true
                        })

                return watchID;
        }

}

export function updateLocation() {
        let newlocation = initialFly();
        return newlocation

}










