#!/usr/bin/env node

var config = require('./config.json')  /// Configuration file with useful parameters

const http = require('http');                         /// http module
const wsserver = require('websocket').server;         /// websocket module (npm install websocket)

/// 1) Create http server and listening.
/// This is not a web server, it is just because we use *WEB*Sockets. 
var httpserver = http.createServer(function(request, response) {});


/// This javascript manages the actor "telescope observer".
var whoami="websocket_server";

/// So let's find all its properties in the configuration file,
/// and append it in the raw form data.
var wss=config.actor.prop.find(function(o){return o.name==whoami});

var port = wss.port       /// Listening on this port from the configuration file.
httpserver.listen(port, function(){                 /// SET SAME PORT ON CLIENT SIDE!
    console.log(utc() + ' --- Server is listening on port '+port);
});

/// 2) Create websocket server
ws = new wsserver({ httpServer: httpserver });

/// 3) Create listener for  connections
var count = 0;                                  /// Reset clients counter
var clients = {};                               /// Store connected client
ws.on('request', function(r){                   /// Listen connections
    var connection = r.accept('echo-protocol', r.origin); /// Accept the connection
    var id = count++;                           /// Specific id for this client & increment count
    clients[id] = connection;                   /// Store the connection method so we can loop through & contact all clients
    console.log(utc() + ' → Peer ' + connection.remoteAddress + ' connected. Connection id: '+id);    
    
    /// 3a) Listen for incoming messages and broadcast
    connection.on('message', function(message){ /// Create event listener
	
	var msgstring = message.utf8Data; /// The string message that was sent to us.
	console.log(' Peer ' + id + " sent me this: " + msgstring);

	var msgobject = JSON.parse(msgstring, null, 2)

	/// [...] here we manipulate msgobject which is a js object
	
	for(var i in clients)
	    /// Send a message to all the connected clients
	    clients[i].send(JSON.stringify(msgobject));
    });
    
    /// 3b) Listen for client disconnection
    connection.on('close', function(reasonCode, description){ /// Create event listener
	delete clients[id];
	console.log((utc()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    
}); /// ws.on

function utc(){
    var a=new Date()
	.toISOString()
	.slice(0,-5);
    return a
    //    replace(/\..+/, '') /// delete the dot and everything after
}
