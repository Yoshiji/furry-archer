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
      socket.emit('update_weather', UTILS.Timeouts.CURRENT_WEATHER);
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

  Socket: {
    by_username: function(sockets, username){
      for(var i = 0, client_length = sockets.clients().length; i < client_length; i++){
        if(sockets.clients()[i] && sockets.clients()[i].session && sockets.clients()[i].session.user.username == username) {
          console.log(sockets.clients()[i]);
          return sockets.clients()[i];
          break;
        }
      }
    },
    by_user_id: function(sockets, user_id){
      for(var i = 0, client_length = sockets.clients().length; i < client_length; i++){
        if(sockets.clients()[i] && sockets.clients()[i].session && sockets.clients()[i].session.user._id == user_id) {
          console.log(sockets.clients()[i]);
          return sockets.clients()[i];
          break;
        }
      }
    }
  },

  Timeouts: {
    CURRENT_WEATHER: {name: 'Sunny', color: '#F5DA81'},

    deploy: function(io) {
      Mongoose = mongoose;
      Tile = mongoose.model('Tile');
      User = mongoose.model('User');

      setInterval(Tile.raise_fertility_routine, 1000*60);
      setInterval(UTILS.Timeouts.generate_rain, 1000*60, io);
      setInterval(User.raise_health_routine, 1000*10);
      setInterval(UTILS.Timeouts.generate_random_disaster, 1000*120, io);
    },
    generate_rain: function(io) {
      var random_percents = Math.floor((Math.random()*100)+1);
      if(random_percents > 75) {

        console.log("Starts Raining")
        var rain = {name: 'Raining', color: '#D8D8D8'};
        UTILS.Timeouts.CURRENT_WEATHER = rain;
        //io.sockets.emit('update_weather', rain);

        var rain_cycles = 5;
        for(var i = 0; i < rain_cycles; i++) {
          setTimeout(Tile.raise_humidity_routine, 5000*(i+1));
        }

        setTimeout(function() {
          console.log("End of Rain")
          var sunny = {name: 'Sunny', color: '#F5DA81'};
          UTILS.Timeouts.CURRENT_WEATHER = sunny;
          //io.sockets.emit('update_weather', sunny);
        }, 5000*rain_cycles);
      }
    },
    generate_random_disaster: function(io) {
      //io.sockets.emit('disaster', { name: 'generating disaster!' });
      var random_percents = Math.floor((Math.random()*100)+1);
      if(random_percents > 75) {
        if( Math.round(Math.random()) ) {

          if( Math.round(Math.random()) ) {
            console.log('!!! Meteor Showers');
            //io.sockets.emit('disaster', { name: 'Meteor Shower' });
            setTimeout(function() {
              Crop.find({}, function(err, crops) {
                crops.forEach(function(crop) {
                  Tile.findOne({crop: crop._id}, function(err, tile) {
                    tile.crop = null;
                    //io.sockets.emit('update_tile', tile);
                    Tile.update({crop: crop._id}, { $pull: { crop: crop._id } }).exec();
                  });
                  crop.remove();
                });
              });
            }, 2000);

          } else {
            console.log('!!! Grasshoppers Invasion');
            //io.sockets.emit('disaster', { name: 'Grasshoppers Invasion' });
            setTimeout(function() {
              Crop.update({}, { maturity: 0 }).exec();
            }, 2000)
          }
        } else {
          console.log('!!! Tornado');
          //io.sockets.emit('disaster', { name: 'Tornado' });
        }
      }
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
      Building = mongoose.model('Building');
      BuildingTemplate = mongoose.model('BuildingTemplate');


      CropTemplate.find(function (err, crop_templates) {
        if(crop_templates.length < 1)
          CropTemplate.generate();
      });

      BuildingTemplate.find(function (err, building_templates) {
        if(building_templates.length < 1)
          BuildingTemplate.generate();
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
        if(tile.crop.length > 0) {
          // Si la crop est a maturité > 80
          if(tile.crop[0].maturity > 80)
            level = 2;
          else
            level = 1;

        } else if(tile.building.length > 0) {
          level = 1;
        } else { // Si c'est notre tile mais n'a pas de Crop
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

          if (tile && tile.is_attacked) {
            available_actions.push(["fire"]);
          }

          BuildingTemplate.find({}, function(err, building_templates) {
            if(building_templates.length > 0) {
              for(var i = 0; i < building_templates.length; i++) {
                available_actions.push(["Build " + building_templates[i].name, building_templates[i].price]);
              }
            }
            socket.emit('update_actions', available_actions);
          });
          
        });

      } else if (level == 1) {
        if (tile && socket && (socket.session.user.username != tile.owner_name) && tile.owner_name != -1 && !tile.is_attacked) {
          available_actions.push(["attack"]);
        } else if (tile && tile.is_attacked) {
            available_actions.push(["fire"]);
        }
        socket.emit('update_actions', available_actions);

      } else if (level == 2) {
        available_actions = [["harvest and sell"]];
        if (tile && socket && (socket.session.user.username != tile.owner_name) && tile.owner_name != -1 && !tile.is_attacked) {
          available_actions.push(["attack"]);
        } else if (tile && tile.is_attacked) {
            available_actions.push(["fire"]);
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

    build: function(tile, building_name, socket) {
      if(tile.crop.length < 1 && tile.building.length < 1) {
        BuildingTemplate.findOne({name: building_name}, function(err, building_template) {
          if(err) { console.log(err); }

          switch(building_template.tile_size) {
            case 1:

              User.check_can_afford(socket.session.user._id, building_template.price, function(user) {
                socket.emit('update_infos', user);
                Building.create({
                  name: building_template.name, storage: building_template.storage, 
                  consommation: building_template.consommation, user: socket.session.user._id,
                  positions: [tile.x, tile.y]
                }, function(err, building) {
                  tile.building = building._id;
                  tile.save();
                  socket.emit('update_building', building);
                });
              });
              
              break;

            case 4:

              var cur_x = tile.x;
              var cur_y = tile.y;
              var x_is_impair = cur_x % 2;
              var y_is_impair = cur_y % 2;
              var in_x; 
              var in_y;
              if(!x_is_impair && !y_is_impair) {
                in_x = [cur_x];
                in_y = [cur_y-1, cur_y, cur_y+1];
                in_x2 = [cur_x+1];
                in_y2 = [cur_y];
              } else if(!x_is_impair && y_is_impair) {
                in_x = [cur_x+1];
                in_y = [cur_y-1, cur_y, cur_y+1];
                in_x2 = [cur_x];
                in_y2 = [cur_y];
              } else if(x_is_impair && y_is_impair) {
                in_x = [cur_x+1];
                in_y = [cur_y-1, cur_y, cur_y+1];
                in_x2 = [cur_x];
                in_y2 = [cur_y];
              } else if(x_is_impair && !y_is_impair) {
                in_x = [cur_x];
                in_y = [cur_y-1, cur_y, cur_y+1];
                in_x2 = [cur_x+1];
                in_y2 = [cur_y];
              } else {
                console.log('WEIRD! Should not happen', cur_x, cur_y);
              }
              var coords = [];
              for(var i=0; i<in_x.length; i++) {
                for(var j=0; j<in_y.length; j++) {
                  coords.push( [ in_x[i], in_y[j] ] );
                }
              }
              for(var i=0; i<in_x2.length; i++) {
                for(var j=0; j<in_y2.length; j++) {
                  coords.push( [ in_x2[i], in_y2[j] ] );
                }
              }

              Tile.find({ $or: [ {x: {$in: in_x }, y: {$in: in_y } }, {x: {$in: in_x2}, y: {$in: in_y2} } ], owner_name: socket.session.user.username }, 
                function(err, tiles) {
                  if(tiles.length > 3) {

                    console.log(coords);
                    Building.findOne({ positions: { $in: coords  } }, function(err, building) {
                      if(err) {console.log(err)}

                      if(!building) {
                        User.check_can_afford(socket.session.user._id, building_template.price, function(user) {
                          socket.emit('update_infos', user);
                          Building.create({
                            name: building_template.name, storage: building_template.storage, 
                            consommation: building_template.consommation, user: socket.session.user._id,
                            positions: coords
                          }, function(err, building) {
                            tiles.forEach(function(tile) {
                              tile.building = building._id;
                              tile.save();
                            });
                            socket.emit('update_building', building);
                          });
                        });
                      }
                    });
                    
                  }
                }
              );

              break;

            case 6:
              break;
          }
        });
     }
    },

    update_tile: function(socket, tile){
      Tile.populate(tile, {path: 'crop'}, function (err, tile_populated) {
        socket.emit('update_tile', tile_populated);
      }); 
    },

    plant: function(tile, crop_name, socket) {
      if(tile.crop.length < 1 && tile.building.length < 1) {
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

            var maturity_interval = setInterval(crop.reload_maturity_routine, crop_template.maturation_time*1000, crop, function(tile) {
              UTILS.Map.update_tile(socket, tile);
            }, function() {
              clearInterval(maturity_interval);
            }, function(tile) {
              UTILS.Map.update_actions(socket, tile);
            });
          });
        });
      }
    },

    attack: function(tile, socket) {
      User.update({ $or: [{_id: socket.session.user._id}, {username: tile.owner_name}]}, {$set: {is_fighting: true}}, {multi: true}, function(err, users){
        if(err) console.log(err)
        console.log(users[0]);
        socket.emit('update_infos', users[0]);
      });
      tile.is_attacked = true;
      tile.attacked_by = socket.session.user.username;
      tile.save(function(err) {
        if(err) console.log(err);
        UTILS.Map.update_actions(socket, tile);
        UTILS.Map.update_tile(socket, tile);

        // send alert if victim is connected
        if(UTILS.Socket.by_username(io.sockets, tile.owner_name))
          UTILS.Socket.by_username(io.sockets, tile.owner_name).emit("attack_alert", {attacker: socket.session.user.username, x: tile.x, y: tile.y});
      });
    },
    fire: function(tile, socket){
      // Find weapon in use
      User.findOne({_id: socket.session.user._id}, function(err, user){
        if(err) console.log(err);

        Weapon.findOne({_id: { $in: user.weapons}, is_in_use: true}, function(err, weapon){
          if(err) console.log(err);

          if(weapon){
            if (weapon.hit_ratio < Math.floor((Math.random()*100)+1)){
              var health_lost = weapon.power * weapon.hits_per_second;
              if(socket.session.user.username == tile.owner_name && tile.attacked_by){
                User.findOne({username: tile.attacked_by}, function(err, user_to_attack){
                  user_to_attack.health -= health_lost;
                  user_to_attack.save(function(err){
                    if(err) console.log(err);

                    if(user_to_attack.health <= 0)
                      UTILS.Map.end_fight(tile, user, user_to_attack, socket);
                  });
                });

              } else if(tile.is_attacked) {
                User.findOne({username: tile.owner_name}, function(err, user_to_attack){
                  user_to_attack.health -= health_lost;
                  user_to_attack.save(function(err){
                    if(err) console.log(err);

                    if(user_to_attack.health <= 0)
                      UTILS.Map.end_fight(tile, user, user_to_attack, socket);
                  });
                });
              }
            }
          }
        });
      });
    },
    
    end_fight: function(tile, user, user_to_attack, socket){
      Tile.find({owner_name: user_to_attack.username, is_attacked: true}, {$set: {is_attacked: false, owner_name: this.attacked_by, attacked_by: false}}, function(err, tiles){
        if(err) console.log(err);

        if(tiles && tiles.length > 0){
          for(var i = 0; i < tiles.length; i++){
            tiles[i].is_attacked = false;
            tiles[i].owner_name = tiles[i].attacked_by;
            tiles[i].attacked_by = false;
            tiles[i].save(function(err){
              if(err) console.log(err);

              socket.emit("update_tile", tiles[i]);
              socket.broadcast.emit("update_tile", tiles[i]);
            });
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