var socketio = require('socket.io');

module.exports.listen = function(app){
  var io = socketio.listen(app);
  io.set('log level', 1);

	// Handle the connection and the events
	io.on('connection', function(socket) {
	  UTILS.Routines.connection(socket);
	  UTILS.Routines.disconnection(socket);
    UTILS.Map.update_weapons(socket);

	  socket.on('chat_message', function (data) {
	    UTILS.Chat.broadcast(socket, data, socket.session.user.username);
	  });

	  socket.on('get_tile', function (data) {
	    Tile.findOne({x: data.x, y: data.y}, function (err, tile) {
	      if(tile) {
	        socket.emit('set_tile', tile);
	      } else {
	        socket.emit('set_tile', {x: data.x, y: data.y, type: "voided"});
	      }
	    });
	  });

	  socket.on('get_player', function() {
	  	User.findOne({_id: socket.session.user._id}, function(err, user) {
	  		if(user) {
	  			user.pos_x = user.pos_x || 0;
	  			user.pos_y = user.pos_y || 0;
	  			socket.emit('set_player', user);
	  		}
	  	});
	  });

	  socket.on('update_player', function(data) {
      User.findOne({_id: data.user_id}, function(err, user) {
        socket.broadcast.emit('update_player', data);

        user.pos_x = data.pos_x;
        user.pos_y = data.pos_y;
        user.save();
        socket.emit('update_infos', user);

        Tile.findOne({x: data.pos_x, y: data.pos_y}).populate('crop').exec(function(err, tile) {
          if(tile && tile.owner_name == -1 && user.remaining_tiles(user) > 0) {
            tile.owner_name = user.username;
            tile.save();
            user.captured_new_tile(user, socket);
            socket.emit('update_tile', tile);
            socket.broadcast.emit('update_tile', tile);
          }
          UTILS.Map.update_actions(socket, tile);
        });
      });

			
	  });

  	socket.on('action', function(data) {
  		// TODO vérifier si le player est réellement proche de cette case
      var action_cleaned = data.action.toLowerCase();
      
      Tile.findOne({x: data.x, y: data.y}, function(err, tile) {
        if(err) console.log(err);

        if((action_cleaned.indexOf("plant") > -1) && (tile.owner_name == socket.session.user.username)) {
          var crop_name = action_cleaned.replace("plant", "").trim();
          UTILS.Map.plant(tile, crop_name, socket);

        } else if (action_cleaned.indexOf("water") > -1) {
          UTILS.Map.update_tile(socket, tile.waterize());

        } else if (action_cleaned.indexOf("fertilize") > -1) {
          User.check_can_afford(socket.session.user._id, 1, function(user) {
            socket.emit('update_infos', user);
            UTILS.Map.update_tile(socket, tile.fertilize());
          });

        } else if (action_cleaned.indexOf("harvest and sell") > -1) {
          tile.harvest_and_sell(socket.session.user._id, tile, function(user) {
            socket.emit('update_infos', user);
          }, function(tile) {
            UTILS.Map.update_tile(socket, tile);
            UTILS.Map.update_actions(socket, tile);
          });

        } else if ((action_cleaned.indexOf("attack") > -1) && (tile.owner_name != socket.session.user.username)) {
          UTILS.Map.attack(tile, socket);

        } else if (action_cleaned.indexOf("buy") > -1) {
          var weapon_id = data.id;
          UTILS.Map.buy_weapon(weapon_id, socket);

        } else if (action_cleaned.indexOf("use") > -1) {
          var weapon_id = data.id;
          UTILS.Map.use_weapon(weapon_id, socket);
        }
      });
  	});

	});

  return io;
};