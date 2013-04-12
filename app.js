
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose')
  , socket = require('socket.io');

// Loads the /config/config.js
exports = module.exports = config = require('./config/config.js');

// Loads the Models
fs.readdirSync('./app/models/').forEach(function (file) {
  var model = require('./app/models/' + file);
  model(mongoose);
});

// Loads Express with the /config/config.js and deployes routes with /config/routes.js
var app = express();
require('./config/express.js')(app, config, mongoose, express);
require('./config/routes.js')(app);

// Creates the server and listen to the port 3000
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Creates the socket Input/Output
var io = socket.listen(server);
io.sockets.on('connection', function(socket) {
  
  console.log("connected");
  socket.emit("welcome", {txt: "Welcome message from the server"})
  socket.on('disconnect', function (client) {
    console.log("disconnected");
  });
  
  socket.on('ping', function (data) {
    socket.emit("pong",{txt:"Pong (from server)"});
  });
});