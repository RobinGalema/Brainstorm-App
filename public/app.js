// --- Ml5 Image classification ---

let mobilenet;
let input;
let prediction;
let inputLink;

// Callback when a result is found
function gotResult(error, results) {
    if (error) throw error
    // Debug
    console.log(results);

    // Send the array of predictions of the image classifier to the server
    prediction = results;
    socket.emit('ml5prediction', prediction);
}

// Callback for when the model is loaded
function modelready() {
    console.log("model is ready");
    console.log(input);
    // Mobilenet classifies the image stored in input
    mobilenet.predict(input, gotResult);
}
    

// Setup function for ml5 and defining the image to use
document.getElementById('startButton').addEventListener("click",function(){

});

// Setup function required for p5 to work
function setup() {
}



// --- Camera ---
var video = document.querySelector("#videoElement");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
}



// --- Start function after button clicked ---

function start(){
    // Get all needed html elements
    const button = document.getElementById('startButton');
    const startText = document.getElementById('startText');
    const foundWords = document.getElementById('foundWords');
    const webcam = document.getElementById('videoElement');

    // Create new elements for the loading page
    let h1 = document.createElement('h1');
    let p = document.createElement('p');
    h1.id = 'placeholderHead';
    p.id = 'placeholderText';
    h1.innerText = 'Loading...';
    p.innerText = "The script is working it's magic! This shouldn't take long!";

    // Get the link from the textbox and store it
    inputLink = document.getElementById('inputBox').value.toString();
    console.log(inputLink);
    
    // Remove the html elements on the screen
    inputBox.remove();
    button.remove();
    startText.remove();
    webcam.hidden = true;

    // Append the created loading screen elements to show while the ml5 library is loading
    foundWords.appendChild(h1);
    foundWords.appendChild(p);

    // Create an image from the input link and load the ml5 library
    input = createImg(inputLink);
    input.hide();
    mobilenet = ml5.imageClassifier('MobileNet', modelready);
}



// --- Socket IO --- 

var socket = io();

// Send a message to the server when the html page is loaded
window.onload = function () {
    console.log("index.html loaded");
    socket.emit('clientMsg', "[client] page loaded");
};

// Check for server messages
socket.on('serverMsg', function (msg) {
    console.log(msg);
})

// Checks if the google api sends a link to an image
socket.on('foundImage', function(foundImage){
    // Create a new image element for the image container
    const imageContainer = document.getElementById('foundImage');
    let imageContent = document.createElement('img');
    imageContent.className = "image";

    // Set the source of the image to the link given by the google api and append it to the image container
    imageContent.src = foundImage;
    imageContainer.appendChild(imageContent);
})

socket.on('imagePrediction', function(imagePrediction){
    // Create a new text element
    const foundWords = document.getElementById('foundWords');
    const canvas = document.getElementById('canvas');
    let content = document.createElement('p');
    content.className = 'predictionText';

    // Put the recieved image pediction on the screen
    content.innerText = `You have drawn: ${imagePrediction}`;
    let enter = document.createElement('br');
    foundWords.appendChild(content);
    foundWords.appendChild(enter);
    canvas.hidden = false;
    var context = canvas.getContext('2d');
    var videoElement = document.getElementById('videoElement');
    context.drawImage(videoElement, 0, 0, 640, 480);
    console.log('snap made');
})

// Detect when the server sends back the array of associations and append those found words to an empty div
socket.on('serverWords', function (words) {
    console.log(words);
    // Get the needed html elements from the index page
    const foundWords = document.getElementById('foundWords');
    const placeholder = document.getElementById('placeholderText');
    const placeholder2 = document.getElementById('placeholderHead');

    // remove the loading screen text
    placeholder.remove();
    placeholder2.remove();
    console.log('Data loaded [loading complete]');

    // Create a text element and append it to the container
    let paragraph = document.createElement("p");
    paragraph.className = 'associationsHead';
    paragraph.innerText = 'Based on your drawing, we found these associations with your word:'
    foundWords.appendChild(paragraph);

    // Create a text element and append it to the container fot each found association in the array recieved from the server
    words.forEach(word => {
        let content = document.createTextNode(word);
        let enter = document.createElement("br");
        foundWords.appendChild(content);
        foundWords.appendChild(enter);
    });

    words.forEach(element => {
        //debug
        console.log(element);

        // Create the link for the google engine to search
        var urlStart = "https://www.googleapis.com/customsearch/v1?key=AIzaSyCf_ZNrvhUMkP6t28I8t-zHwScyJv3u21U&cx=011039081965954186716:44ojrzsn6oh&searchType=image&q=";
        var fullUrl = urlStart + element;
        console.log(fullUrl);

        // Send the generated url to the server
        socket.emit('googleJson', fullUrl);
    });
})