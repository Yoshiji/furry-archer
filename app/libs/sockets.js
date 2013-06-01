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
	  			user.pos_x = user.pos_x || 5;
	  			user.pos_y = user.pos_y || 5;
	  			socket.emit('set_player', user);
	  		}
	  	});
	  });

	  socket.on('update_player', function(data) {
	  	User.update({_id: data.user_id}, data, {}, function(err, users) {
        User.findOne({_id: data.user_id}, function(err, user) {
          socket.broadcast.emit('update_player', data);
        });
      });

			Tile.findOne({x: data.pos_x, y: data.pos_y})
      .populate('crop')
      .exec(function(err, tile) {

				if(tile && tile.crop && tile.crop.length > 0) {
					if(tile.crop[0].maturity > 80)
            socket.emit('update_actions', Actions[2]);
          else
            socket.emit('update_actions', Actions[1]);

				} else {
					CropTemplate.find({},function(err, crop_templates) {
						if(crop_templates.length > 0) {
							var available_actions = [];
							for (var i = 0, length = crop_templates.length; i < length; i++) {
								available_actions[i] = Actions[0] + " " + crop_templates[i].name;
							}
							socket.emit('update_actions', available_actions);
						}
					});
				}
			});
	  });

  	socket.on('action', function(data) {
  		// TODO vérifier si le player est réellement proche de cette case
      // TODO définir health_limit pour le level 2 des actions
      var action_cleaned = data.action.toLowerCase();
      
      Tile.findOne({x: data.x, y: data.y}, function(err, tile) {
        if(err) { console.log(err); return; };

        if(action_cleaned.indexOf("plant") > -1) {
          var crop_name = action_cleaned.replace("plant", "").trim();

          CropTemplate.findOne({ name: crop_name }, function (err, crop_template) {

            crop_template._id = Mongoose.Types.ObjectId();
            var crop = new Crop(crop_template);
            crop.maturity = 0;

            crop.save(function(err) {
              tile.crop = crop._id;
              tile.save(function(err) {
                socket.emit('update_tile', tile);
                socket.emit('update_actions', Actions[1]);
              });
            });

            setInterval(crop.reload_maturity, crop_template.maturation_time*1000, crop, socket);
          });

        } else if (action_cleaned.indexOf("water") > -1) {
          socket.emit('update_tile', tile.waterize());

        } else if (action_cleaned.indexOf("fertilize") > -1) {
          socket.emit('update_tile', tile.fertilize());

        } else if (action_cleaned.indexOf("harvest") > -1) {
          socket.emit('update_tile', tile.harvest(socket));       
        }        
      });
  	});

	  socket.on('sync_tile', function(data) {
	  	Tile.update({x: data.x, y: data.y}, data, {}, function(err, tiles){

		  	Tile.findOne({x: data.x, y: data.y}, function(err, tile){
	  			socket.emit('update_tile', tile);
	  			socket.broadcast.emit('update_tile', tile);
		  	});
	  	});
	  });

	});

  return io;
};