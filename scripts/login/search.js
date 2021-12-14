let text = document.getElementById('button')
let value = document.getElementById('newdata').value;
console.log(value)

const h= ['1','2','3']; 

// prevent form from refreshing on click 
var form = document.getElementById("form");
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);

export default function search() {
    value = document.getElementById('newdata').value;
    console.log(value)
    if (h.includes(value)) {
        console.log('Success! you can start playing')
        
    } else {
        console.log('Get a token and come back')
    }
}


text.addEventListener('click', search)