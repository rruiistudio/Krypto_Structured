// UTILITY FUNCTIONS

// api pass handler ------------------------------------------------------------------------------------>

export function passboxfound(boxID, boxIndex) {
        var api_link = 'https://api.kryptomon.co/egg-hunt/openBox.php';
        var userID = localStorage.getItem('walletID')
        var json = {
                walletID: userID,
                boxID: boxID[boxIndex]
        }

        var SendInfo = JSON.stringify(json);
        $.post(api_link, SendInfo, handledata)

        function handledata() {
                g = JSON.parse(response)
                console.log(g)
        }
}

// user position handlers ------------------------------------------------------------------------------>
let userlocation;
let coords = [];
let long, lat


var options = {
        enableHighAccuracy: true,
        trackUserLocation: true,

};

export function success(pos) {
        long = pos.coords.longitude;
        lat = pos.coords.latitude;
        localStorage.setItem('userLong', long)
        localStorage.setItem('userLat', lat)
        console.log('items stored')

}

export function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
}



export function location() {
        navigator.geolocation.getCurrentPosition(success, error, options)
}


export async function storeInitialLocation() {
        coords = [localStorage.getItem('userLong'), localStorage.getItem('userLat')]
        console.log('items retrieved')
        return coords
}

location();
storeInitialLocation();
export default userlocation = [parseFloat(coords[0]), parseFloat(coords[1])];

// box handlers ---------------------------------------------------------------------------------------->

export function calculateDistance(data, location) {

        var from = turf.point(location);
        var to = turf.point(data);

        var options = { units: 'meters' };
        var distance = Math.round(turf.distance(from, to, options));
        return distance;

};

export function closestPoint(distances, index) {
        const min = Math.min(...distances);
        index = distances.indexOf(min);

        return index;
}


//map data handlers ------------------------------------------------------------------------------------>
export function addInfo(map, id, data, color) {
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

export function addData(map, layer, data) {
        map.getSource(layer).setData(data);

}


//position handlers ------------------------------------------------------------------------------------>

export function initialFly(map) {
        navigator.geolocation.getCurrentPosition((position) => {
                map.flyTo({
                        center: [position.coords.longitude, position.coords.latitude],
                        zoom: 20,
                        speed: 1.5,
                        curve: 1,
                })
        })
}


// generates 3 locations around the user- that's the whole purpose of this function.
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

        return json
}

export async function generateRoute() {
        let firstP = json.features[0].geometry.coordinates;
        console.log(firstP);

        // initial spawnBox > retrieve 3 boxes > give each box a status > if status == available, count within the array 

        // add to map: 
        mysterybox(json);
        getRoute(userlocation, firstP)

}
