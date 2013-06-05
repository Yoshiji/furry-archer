var socketio = require('socket.io');

module.exports.listen = function(app){
  var io = socketio.listen(app);
  io.set('log level', 1);

	// Handle the connection and the events
	io.on('connection', function(socket) {
	  UTILS.Routines.connection(socket);
	  UTILS.Routines.disconnection(socket);
	  
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
          // Si n'est pas owner et peut encore capturer des tiles
          if(tile && tile.owner_name != user.username && user.remaining_tiles(user) > 0) {
            tile.owner_name = user.username;
            tile.save();
            user.captured_new_tile(user, socket);
            socket.emit('update_tile', tile);
            socket.broadcast.emit('update_tile', tile);
          }
          // Si le player est le owner
          if(tile && tile.owner_name == user.username) {
            // Si il y a un crop sur la tile
            if(tile && tile.crop && tile.crop.length > 0) {
              // Si la crop est a maturité > 80
              if(tile.crop[0].maturity > 80)
                UTILS.Map.update_actions.level2(socket);
              else
                UTILS.Map.update_actions.level1(socket);

            } else {
              UTILS.Map.update_actions.level0(socket);
            }
          } else {
            UTILS.Map.update_actions.level1(socket);
          }
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
          User.findOne({_id: socket.session.user._id}, function(err, user) {
            if(!user) 
              return;
            if(user.gold > 1) {
              user.gold -= 1;
              user.save();
              socket.emit('update_infos', user);
              UTILS.Map.update_tile(socket, tile.fertilize());
            }
          });         

        } else if (action_cleaned.indexOf("harvest") > -1) {
          UTILS.Map.update_tile(socket, tile.harvest());
          UTILS.Map.update_actions.level0(socket);
        } 
      });
  	});
	});

  return io;
};