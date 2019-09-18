// --- Ml5 Image classification ---
let mobilenet;
let input;
let prediction;
let inputLink;

// Callback when a result is found
function gotResult(error, results) {
    if (error) throw error
    console.log(results);
    prediction = results;
    socket.emit('ml5prediction', prediction);
}

// Callback for when the model is loaded
function modelready() {
    console.log("model is ready");
    console.log(input);
    mobilenet.predict(input, gotResult);
}
    

// Setup function for ml5 and defining the image to use
document.getElementById('startButton').addEventListener("click",function(){

});
function setup() {
}

function start(){
    const button = document.getElementById('startButton');
    const startText = document.getElementById('startText');
    const foundWords = document.getElementById('foundWords');
    let h1 = document.createElement('h1');
    let p = document.createElement('p');
    h1.id = 'placeholderHead';
    p.id = 'placeholderText';
    h1.innerText = 'Loading...';
    p.innerText = "The script is working it's magic! This shouldn't take long!";

    inputLink = document.getElementById('inputBox').value.toString();
    console.log(inputLink);
    
    inputBox.remove();
    button.remove();
    startText.remove();
    foundWords.appendChild(h1);
    foundWords.appendChild(p);

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

socket.on('foundImage', function(foundImage){
    const imageContainer = document.getElementById('foundImage');
    let imageContent = document.createElement('img');
    imageContent.src = foundImage;
    imageContainer.appendChild(imageContent);
})

socket.on('imagePrediction', function(imagePrediction){
    const foundWords = document.getElementById('foundWords');
    let content = document.createElement('p');
    content.className = 'predictionText';
    content.innerText = `Image prediction: ${imagePrediction}`;
    let enter = document.createElement('br');

    foundWords.appendChild(content);
    foundWords.appendChild(enter);
})

// Detect when the server sends back the array of associations and append those found words to an empty div
socket.on('serverWords', function (words) {
    console.log(words);
    const foundWords = document.getElementById('foundWords');
    const placeholder = document.getElementById('placeholderText');
    const placeholder2 = document.getElementById('placeholderHead');

    placeholder.remove();
    placeholder2.remove();
    console.log('Data loaded [loading complete]');

    let paragraph = document.createElement("p");
    paragraph.className = 'associationsHead';
    paragraph.innerText = 'I found these associations:'
    foundWords.appendChild(paragraph);

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
        socket.emit('googleJson', fullUrl);
    });
})