let boxstatus = localStorage.getItem('box_status')
let s
boxstatus = JSON.parse(boxstatus)
console.log(boxstatus)

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