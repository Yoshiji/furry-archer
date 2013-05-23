var express = require('express')
  , http = require('http')
  , fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose')
  , connect = require('connect')
  , session_store = new express.session.MemoryStore()
  , cookieParser = express.cookieParser('lapin')
  , app = express();

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
  },
  Map: {
    generate: function() {
      Tile = mongoose.model('Tile');


      Tile.find(function (err, tiles) {
        if (tiles.length < 1) {
          var map_size = 20;
          var water_tiles = [];
          var lakes_number = 8;

          for( var k = 0; k < lakes_number; k++ ) {
            var water_width = Math.floor(Math.random()) + 2;
            var offset_x = Math.floor(Math.random()*10)*Math.floor(map_size/10) + 1;
            var offset_y = Math.floor(Math.random()*10)*Math.floor(map_size/10) + 1;
            for( var l = 0; l < water_width; l++ ) {
              var water_height = Math.floor(Math.random()) + 3;
              for( var m = 0; m < water_height; m++) {
                water_tiles.push({ x: l+offset_x, y: m+offset_y });
              }
            }
          }

          for(var i = 0; i < map_size; i++) {
            for(var j = 0; j < map_size; j++) {
              var type = 'grass';
              for(k = 0; k < water_tiles.length; k++) {
                if(water_tiles[k].x == i && water_tiles[k].y == j) {
                  type = 'water';
                  water_tiles.splice(k, 1);
                  break;
                }
              }
              Tile.create(
                { x: i, y: j, type: type, owner_name: -1 }, function (err, user) {
                    if(err) { console.log(err); 
                  }
              });
              console.log("Tile created: { x: "+i+", y: "+j+", type: "+type+" }");
            }
          }
        }
      });
    }
  }
}

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
var io = require('./app/libs/sockets').listen(server);

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

UTILS.Map.generate();


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