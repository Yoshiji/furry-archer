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
    connection: function(socket) {
      socket.session = socket.handshake.session;
      UTILS.Chat.broadcast(socket, socket.session.user.username + ' connected!');
      User.find({_id: socket.session.user_id}, function(err, users) {
        if(users.length > 0) {
          var user = users[0];
          var data = { current_pos: user.current_pos, user_id: user._id };
          socket.broadcast.emit('update_player', data);
        } 
      });
    },
    disconnection: function(socket) {
      socket.on('disconnect', function (data) {
        UTILS.Chat.broadcast(socket, 'Client Disconnected!');
      });
    }
  },
  Map: {
    generate: function() {
      Mongoose = mongoose;
      Tile = mongoose.model('Tile');
      CropTemplate = mongoose.model('CropTemplate');
      Crop = mongoose.model('Crop');
      Actions = [["plant"], ["water", "fertilize"], ["harvest"]]; // actions with their levels

      var init_crop_templates = ['tomato', 'corn', 'cereal'];

      CropTemplate.find(function (err, crop_templates) {
        if(crop_templates.length < 1) {
          for( var i = 0; i < init_crop_templates.length; i++ ) {
            CropTemplate.create(
            { name: init_crop_templates[i],
              maturation_time: 3,
              decay_time: 10,
              productivity: 10,
              storability: 15,
              seed_price: 90
            }, function (err, crop_template) {
              if(err)
                console.log(err); 
              else
                console.log("creating crop template: ", crop_template); 
            });
          }
        }
      });

      Tile.find(function (err, tiles) {
        if (tiles.length < 1) {
          var map_size = 20;
          var bands = [ [1, 45], [45, 75], [75, 110], [45, 75], [1, 45] ];

          for(var i = 0; i < map_size; i++) {
            var current_band = bands[i%5];

            for(var j = 0; j < map_size; j++) {
              var humidity_rand = Math.floor(Math.random()*100) + 1; 
              var fertility_rand = Math.floor(Math.random()*(current_band[1]-current_band[0])) + current_band[0];
              
              if(fertility_rand > 100) {
                var type = 'water';
              } else {
                var type = 'grass';
              }                

              var attributes = { x: i, 
                  y: j, 
                  type: type, 
                  owner_name: -1, 
                  humidity: humidity_rand,
                  fertility: fertility_rand,
                }

              Tile.create( attributes, function (err, tile) {
                  if(tile) { 
                    console.log("Tile created: { x: "+tile.x+", y: "+tile.y+", type: "+tile.type+", fertility: "+tile.fertility+", humidity: "+tile.humidity+" }"); 
                  }
                  if(err) { console.log(err); }
                }
              );
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
  if (file != ".DS_Store"){
    var model = require('./app/models/' + file);
    model(mongoose);
  }
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