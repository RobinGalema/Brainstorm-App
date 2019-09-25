var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');
var dot = require('dot-object');
const fetch = require('node-fetch');
var publicDir = require('path').join(__dirname,'/public');

// Set the page to index.html
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

app.use(express.static(publicDir));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// Detect when a user connects to the server
io.on('connection', function(socket){
    console.log('User Connected');
    socket.emit('serverMsg', 'yeet');

    // Detect when the client sends a message to the server
    socket.on('clientMsg', function(msg){
        //DEBUG
        console.log(msg);
    })

    // Detect when the client sends the link for the google api
    socket.on('googleJson', function(link){
        console.log(link);
        // Get the json file from the google link
        
        fetch(link)
        .then(res => res.json())
        .then(function(json){
            // Debug
            console.log(json.items[0].image.thumbnailLink);

            // Get the first image from the google json file
            let foundImage = json.items[0].image.thumbnailLink;
            // Send the image link to the client
            socket.emit('foundImage', foundImage);     
        });
        
    })

    // Detect when the client sends data to the server
    socket.on('ml5prediction', function(data){
        // Log the associations found by ml5
        console.log(data);

        // Put the first found association found in a string
        let result = data[0].label.toString();
        console.log(result);
        console.log(result.indexOf(','));
        // Split the string to only get the first association
        if (result.indexOf(',') != -1){
        result = result.substring(0,result.indexOf(','));
        };
        // Debug
        console.log(`Result = ${result}`);

        // Search for word associations in the json file
        fs.readFile('words.json', (err, data) => {
            if (err) throw err;
            let words = JSON.parse(data);
        
            // Debug
            //console.log(words);

            // Get the path to the associations of the found word in the words object
            let path = `${result}.associations`;
            // Convert the path to dot notation with dot-object.js
            var val = dot.pick(path,words);
            console.log(val);

            // Log the associations found
            for (i=0; i<val.length; i++)
            {
                console.log(`[${i}]: ${val[i]}`);
            }
            // send the found words array to the client
            socket.emit('imagePrediction', result);
            socket.emit('serverWords', val);

        });
    })
})


