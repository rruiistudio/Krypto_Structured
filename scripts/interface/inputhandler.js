// what do i need in the input handler? 

//this is a utility function - input feature points, return poi
import papaparse from './modules/papaparse.js'
//prevent page from reloading on submit
var form = document.getElementById("form");
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

//get button
let b = document.getElementById('button');

// get city centers 
let cities;
let file;

//filter = document.getElementById('newdata').value; //get tags



// read button data & store

function print() {
    
    file = document.getElementById('newdata').value;
    //cities = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    var json = JSON.stringify(cities);
    console.log(file)
   // fs.writeFile("data.json", json);
}

b.addEventListener('click', print);


// data;