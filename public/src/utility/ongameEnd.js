let boxstatus = localStorage.getItem('box_status')
let walletID = localStorage.getItem('walletID')
let s
boxstatus = JSON.parse(boxstatus)
console.log(boxstatus)

let URL = "https://api.kryptomon.co/egg-hunt/getUser.php";

buttonclickhandler();


if (boxstatus.every(isfound)) {
    console.log('all elements are found!')
    window.location.href = '/html/ongameend.html';
}

if (boxstatus.every(isnotFound)) {
    console.log('none of the elements are found')
}

function isfound(s) {
    return s == 'found';
}

function isnotFound(s) {
    return s == 'notFound';
}


function buttonclickhandler() {
    let data = { walletId: walletID };
    var SendInfo = JSON.stringify(data);
    console.log(SendInfo)

    $.post(URL, SendInfo, handledata)
}

function handledata(response) {
    let g = JSON.parse(response)
    console.log(g)
    let boxes = g.boxes;
    let bLen = boxes.length;
    console.log(bLen)

    if (bLen == 0) {
        console.log('No more boxes, game ended');
        //localStorage.remove('walletID')
        //localStorage.remove('box1')
        //localStorage.remove('box2')
        //localStorage.remove('box3')
        window.location.href = '/html/ongameend.html';
    } else {
        console.log('Game continues.')
    }
}