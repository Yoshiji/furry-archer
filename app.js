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
      User.findOne({_id: socket.session.user._id}, function(err, user) {
        if(user) {
          user.recalc_level(user, socket);
          var data = { pos_x: user.pos_x, pos_y: user.pos_y, user_id: user._id };
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

  Timeouts: {
    deploy: function() {
      setInterval(Tile.raise_fertility_routine, 1000*60);
      setInterval(UTILS.Timeouts.generate_rain, 1000*60);
      setInterval(User.raise_health_routine, 1000*10);
    },
    generate_rain: function() {
      var random_percents = Math.floor((Math.random()*100)+1);
      if(random_percents > 70) {
        var rain_interval = setInterval(Tile.raise_humidity_routine, 1000*10);
        setTimeout(function(rain_interval) {
          console.log("clearing interval rain");
          clearInterval(rain_interval);
        }, 1000*31)
      }
    },
    raise_health: function(){

    }
  },

  Map: {

    deploy_settings: function() {
      Settings = mongoose.model('Settings');
      SETTINGS = null;

      Settings.findOne({}, function (err, settings) {
        if(settings) {
          SETTINGS = settings;
          UTILS.Map.settings_callback();
        } else {

          var default_values = { ratio_level_tile: 0.5, offset_level_tile: 10, 
            cycle_duration: 60, tiles_to_next_level: 10, gold_amount_at_starting: 20 };
          Settings.create(default_values, function(err, settings) {
            SETTINGS = settings;
            UTILS.Map.settings_callback();
          });
        }
      });
    },

    settings_callback: function() {
      //starts the cycle of the captured_tiles for each user
      var cycle_duration = SETTINGS.cycle_duration * 500;
      var User = mongoose.model('User');
      User.reinit_captured_tiles();
      setInterval(User.reinit_captured_tiles, cycle_duration);
    },

    generate: function() {
      Mongoose = mongoose;
      Tile = mongoose.model('Tile');
      Crop = mongoose.model('Crop');
      CropTemplate = mongoose.model('CropTemplate');
      Weapon = mongoose.model('Weapon');
      WeaponTemplate = mongoose.model('WeaponTemplate');
      User = mongoose.model('User');
      
      UTILS.Timeouts.deploy();

      CropTemplate.find(function (err, crop_templates) {
        if(crop_templates.length < 1)
          CropTemplate.generate();
      });

      WeaponTemplate.find(function (err, weapon_templates) {
        if(weapon_templates.length < 1)
          WeaponTemplate.generate();
      });

      Tile.find(function (err, tiles) {
        if (tiles.length < 1)
          Tile.generate();
      });
    },

    update_actions: function(socket, tile){
      var available_actions = [["water"], ["fertilize", 1]];
      var level = 1; 

      // LEVEL DETERMINATION
      if(tile && tile.owner_name == socket.session.user.username) {
        // Si il y a un crop sur la tile
        if(tile && tile.crop && tile.crop.length > 0) {
          // Si la crop est a maturité > 80
          if(tile.crop[0].maturity > 80)
            level = 2;
          else
            level = 1;

        } else {
          level = 0;
        }
      }

      if(level == 0) {
        CropTemplate.find({},function(err, crop_templates) {
          if(crop_templates.length > 0) {
            for (var i = 0, length = crop_templates.length; i < length; i++) {
              available_actions.push(["Plant " + crop_templates[i].name, crop_templates[i].seed_price]);
            }
          }
          socket.emit('update_actions', available_actions);
        });
      } else if (level == 1) {
        if (tile && socket && (socket.session.user.username != tile.owner_name) && tile.owner_name != -1) {
          available_actions.push(["attack"]);
        }
        socket.emit('update_actions', available_actions);
      } else if (level == 2) {
        available_actions = [["harvest and sell"]];
        if (tile && socket && (socket.session.user.username != tile.owner_name) && tile.owner_name != -1) {
          available_actions.push(["attack"]);
        }
        socket.emit('update_actions', available_actions);
      }
    },

    update_weapons: function(socket){
      var weapons_actions = [];
      WeaponTemplate.find({},function(err, weapon_templates) {

        if(weapon_templates.length > 0) {
          User.findOne({_id: socket.session.user._id}).populate('weapons').exec(function(err, user){
            
            for (var i = 0, wt_length = weapon_templates.length; i < wt_length; i++) {
              var already_bought = false;

              if(user.weapons && user.weapons.length > 0){
                for (var j = 0, length = user.weapons.length; j < length; j++) {

                  if(weapon_templates[i].name == user.weapons[j].name){
                    already_bought = user.weapons[j];
                    break;
                  }
                }
              }
              if(already_bought)
                if(already_bought.is_in_use == true)
                  weapons_actions.push(["Using " + weapon_templates[i].name, false, already_bought._id, already_bought.is_in_use]);
                else
                  weapons_actions.push(["Use " + weapon_templates[i].name, false, already_bought._id, already_bought.is_in_use]);

              else
                weapons_actions.push(["Buy " + weapon_templates[i].name, weapon_templates[i].price, weapon_templates[i]._id]);
            }

            socket.emit('update_weapons', weapons_actions);
          });
        }
      });
    },

    buy_weapon: function(weapon_id, socket){
      WeaponTemplate.findOne({ _id: weapon_id }, function (err, weapon_template) {
        if (weapon_template) {
          User.check_can_afford(socket.session.user._id, weapon_template.price, function(user) {
            weapon_template._id = Mongoose.Types.ObjectId();
            var weapon = new Weapon(weapon_template);

            weapon.save(function(err) {
              if(err) { console.log(err);}

              if(user.weapons)
                user.weapons.push(weapon._id);
              else
                user.weapons = weapon._id;
              user.save(function(err) {
                if(err) { console.log(err);}
                UTILS.Map.update_weapons(socket, user);
              });
            });
          });
        }
      });
    },

    use_weapon: function(weapon_id, socket){
      User.findOne({_id: socket.session.user._id}, function(err, user){
        Weapon.update({_id:{ $in: user.weapons}}, { $set: { is_in_use: false }}, { multi: true }, function(err){
          if(err) console.log(err);

          Weapon.update({_id: weapon_id}, { $set: { is_in_use: true }}, function(err){
            if(err) console.log(err);
            UTILS.Map.update_weapons(socket, user);
          });
        });

      });
    },

    update_tile: function(socket, tile){
      Tile.populate(tile, {path: 'crop'}, function (err, tile_populated) {
        socket.emit('update_tile', tile_populated);
      }); 
    },

    plant: function(tile, crop_name, socket) {
      CropTemplate.findOne({ name: crop_name }, function (err, crop_template) {
        User.check_can_afford(socket.session.user._id, crop_template.seed_price, function(user) {
          socket.emit('update_infos', user);
          crop_template._id = Mongoose.Types.ObjectId();
          var crop = new Crop(crop_template);
          crop.maturity = 0;

          crop.save(function(err) {
            if(err) { console.log(err);}

            tile.crop = crop._id;
            tile.save(function(err) {
              if(err) { console.log(err);}
              
              UTILS.Map.update_actions(socket, tile);
              UTILS.Map.update_tile(socket, tile);
            });
          });

          var maturity_interval = setInterval(crop.reload_maturity, crop_template.maturation_time*100, crop, function(tile) {
            UTILS.Map.update_tile(socket, tile);
          }, function() {
            clearInterval(maturity_interval);
          }, function(tile) {
            UTILS.Map.update_actions(socket, tile);
          });
        });
      });
    },

    attack: function(tile, socket) {
      User.update({_id: socket.session.user._id}, {$set: {is_fighting: true}}, function(err, user){
        if(err) console.log(err)
        console.log(user);
        socket.emit('update_infos', user);
      });
      tile.is_attacked = true;
      tile.save(function(err) {
        if(err) console.log(err);
        UTILS.Map.update_actions(socket, tile);
        UTILS.Map.update_tile(socket, tile);
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

UTILS.Map.deploy_settings();
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