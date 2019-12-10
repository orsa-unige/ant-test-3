const config = require('./config.json');
const WebSocket = require('ws');

/// Let's take some properties of the websocket server:I need the ip and the port
var wss = config.actor.prop.find(function(o){return o.name=="websocket_server";});

/// No need to require(websocket) : browsers natively support it.
var ws = new WebSocket('ws://'+wss.ip
		          +':'+wss.port, 'echo-protocol');

var obj={};
obj.actor={};
obj.actor.name="console";

module.exports = {

    send: function(msg) {
        
        ws.send(JSON.stringify({...obj, ...msg}));
        return this;
    },

    enable: function(msg)  {        
        ws.send(JSON.stringify({...obj, enable:msg}));
        return this;
    },

    disable: function(msg)  {        
        ws.send(JSON.stringify({...obj, disable:msg}));
        return this;
    }
    
};
