#!/usr/bin/env node

var config = require('./config.json')  /// Configuration file with useful parameters

var wsclient = require('websocket').client; /// Create a websocket client
 
var client = new wsclient();


/// Let's create an object where we will put the random number.
var mess={}

/// This javascript manages the actor "dummy 1".
var whoami="dummy_1";

/// So let's find all its properties in the configuration file,
/// and append it in the raw form data.
mess.actor=config.actor.prop.find(function(o){return o.name==whoami});  
mess.randomnumbers=[]


client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
    function sendNumbers() {
        if (connection.connected) {

	    /// I create a pair or random data.
            var xx = Math.round(Math.random() * 0xFFFFFF);
            var yy = Math.round(Math.random() * 0xFFFFFF);	  
	    	    
	    /// I append the random number to the json    
	    //mess.randomnumbers.push({x:xx, y:yy}) /// This adds a pair every loop
		mess.randomnumbers =[xx, yy]

	    connection.sendUTF(JSON.stringify(mess));
            setTimeout(sendNumbers, 2000);
        }
    }

    sendNumbers();

});

/// Let's take some properties of the websocket server:I need the ip and the port
var wss = config.actor.prop.find(function(o){return o.name=="websocket_server"});
 
client.connect('ws://'+wss.ip+":"+wss.port, 'echo-protocol');
