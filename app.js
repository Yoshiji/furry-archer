
var express = require('express')
  , http = require('http')
  , fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose')
  , socket_io = require('socket.io')
  , connect = require('connect')
  , session_store = new express.session.MemoryStore()
  , cookieParser = express.cookieParser('lapin')
  , app = express();


// Loads the /config/config.js
exports = module.exports = config = require('./config/config.js');

// Loads the Models
fs.readdirSync('./app/models/').forEach(function (file) {
  var model = require('./app/models/' + file);
  model(mongoose);
});

// Loads Express with the /config/express.js and deploys routes with /config/routes.js
require('./config/express.js')(app, config, mongoose, express, session_store);
require('./config/routes.js')(app);

// Creates the HTTP server and the Socket.io
var server = http.createServer(app);
var io = socket_io.listen(server);


// Handle the connection and the events
io.on('connection', function(socket) {
  UTILS.Routines.connection(socket);
  UTILS.Routines.disconnection(socket);
  
  socket.on('chat_message', function (data) {
    UTILS.Chat.broadcast(socket, data, socket.session.user.username);
  });
});

// Links the socket with the session
io.set('authorization', function(data, accept) {
  cookieParser(data, {}, function(err) {
    if (err) {
      accept(err, false);
    } else {
      session_store.get(data.signedCookies['connect.sid'], function(err, session) {
        if (err || !session) {
          accept('Session error', false);
        } else {
          data.session = session;
          accept(null, true);
        }
      });
    }
  });
});

// Hash of several functions
UTILS = {
  Chat: {
    broadcast: function(socket, msg, author) {
      author = author || 'System';
      socket.broadcast.emit('chat_message', {author: author, message: msg});
      socket.emit('chat_message', {author: author, message: msg});
    }
  },
  Routines: {
    connection: function(client) {
      client.session = client.handshake.session;
      var player_list = new PlayerList();
      client.emit('player_list', player_list.list);
      client.broadcast.emit('player_list', player_list.list);
      UTILS.Chat.broadcast(client, client.session.user.username + ' connected!');
    },
    disconnection: function(client) {
      client.on('disconnect', function (data) {
        UTILS.Chat.broadcast(client, 'Client Disconnected!');
        var player_list = new PlayerList();
        client.broadcast.emit('player_list', player_list.list);
      });
    }
  }
}

// Models but not really models, needs to be clarified because not a Mongoose Model, neither a controller ...!
PlayerList = (function() {

  function PlayerList() {
    this.list = [];
    for (var i = 0, len = io.sockets.clients().length; i < len; i++) {
      var client = io.sockets.clients()[i];
      if(client.session.user == undefined){ client.session.user = {username: 'Toby', id: '0' }}
      var player = {
        'socketID': client.id,
        'username': client.session.user.username,
        'user_id': client.session.user.id
      };
      this.list.push(player);
    }
  }

  return PlayerList;
})();


server.listen(app.get('port'));