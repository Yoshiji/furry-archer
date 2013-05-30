var socketio = require('socket.io');

module.exports.listen = function(app){
  var io = socketio.listen(app);

	// Handle the connection and the events
	io.on('connection', function(socket) {
	  UTILS.Routines.connection(socket);
	  UTILS.Routines.disconnection(socket);
	  
	  socket.on('chat_message', function (data) {
	    UTILS.Chat.broadcast(socket, data, socket.session.user.username);
	  });

	  socket.on('get_tile', function (data) {
	    Tile.find({x: data.x, y: data.y}, function (err, tiles) {
	      if (tiles.length > 0){
	        socket.emit('set_tile', tiles[0]);
	      } else {
	        socket.emit('set_tile', {x: data.x, y: data.y, type: "voided"});
	      }
	    });
	  });

	  socket.on('get_player', function() {
	  	User.find({_id: socket.session.user._id}, function(err, users) {
	  		if(users.length > 0) {
	  			var user = socket.session.user;
	  			user.pos_x = users[0].pos_x || 5;
	  			user.pos_y = users[0].pos_y || 5;
	  			socket.emit('set_player', user);
	  		}
	  	});
	  });

	  socket.on('update_player', function(data) {
	  	User.update({_id: data.user_id}, data, {}, function(err, tiles) { 
	  		if(err) console.log(err);
	  		else{
	  			socket.broadcast.emit('update_player', data);


	  			// Find CROP Data
	  			console.log("********* UPDATE PLAYER **********");

	  			Tile.findOne({x: data.pos_x, y: data.pos_y})
          .populate('crop')
          .exec(function(err, tile){

	  				if(err) console.log(err);
						console.log("********* TILE FOUND **********\n", tile);

  					if(tile.crop.length > 0){
  						if(tile.crop.health == 100) // TODO set limit of health for actions level 2
                socket.emit('update_actions', Actions[2]);
              else
                socket.emit('update_actions', Actions[1]);

  					}else{
  						console.log("********* NO CROP **********");
  						CropTemplate.find({},function(err, crop_templates){

								if(err) console.log(err);
  							else if(crop_templates.length > 0){
  								console.log("********* SEND LEVEL 0 ACTIONS **********");
  								var available_actions = [];
  								for (var i = 0, length = crop_templates.length; i < length; i++) {
										available_actions[i] = Actions[0] + " " + crop_templates[i].name;
  								}
  								socket.emit('update_actions', available_actions);
  							}
  						});
  					}
	  			});
	  		}
	  	});
	  });

  	socket.on('action', function(data) {
  		// TODO vérifier si le player est réellement proche de cette case
      // TODO définir health_limit pour le level 2 des actions
      var action_cleaned = data.action.toLowerCase();

      if(action_cleaned.indexOf("plant") > -1) {
        var search = action_cleaned.replace("plant", "").trim();

    		CropTemplate.findOne({ name: search }, function (err, crop_template) {
      		if (err) console.log(err);
      		console.log('CROP TEMPLATE FOUND', crop_template); // Space Ghost is a talk show host.

      		// TODO add health param before saving crop in tile
          crop_template._id = Mongoose.Types.ObjectId();
          console.log("CROP AFTER CHANGING ID JAVASCRIPT", crop_template);

          var crop = new Crop(crop_template);
          crop.save(function(err){
            if (err) console.log(err);
        		Tile.update({x: data.x, y: data.y}, {crop: crop._id}, function(err, tiles){
      				if (err) console.log(err);
      				console.log('UPDATE TILE CROP -----------------------');
        		});
          });

      		Tile.findOne({x: data.x, y: data.y}, function(err, tile){
    				if (err) console.log(err);
            socket.emit('update_tile', tile);
            socket.emit('update_actions', Actions[1]);
    				console.log('UPDATE TILE EMIT - UPDATE ACTIONS -----------------------', tile);
      		});

    		});

      } else if (action_cleaned.indexOf("water") > -1){
        Tile.update({x: data.x, y: data.y}, {humidity: 100}, function(err, tiles){
          if (err) console.log(err);

          Tile.findOne({x: data.x, y: data.y}, function(err, tile){
            if (err) console.log(err);

            socket.emit('update_tile', tile);
            console.log('UPDATE TILE CROP WATER -----------------------', tile);
          });
        });

      } else if (action_cleaned.indexOf("fertilize") > -1){
        Tile.update({x: data.x, y: data.y}, {fertility: 100}, function(err, tiles){
          if (err) console.log(err);

          Tile.findOne({x: data.x, y: data.y}, function(err, tile){
            if (err) console.log(err);

            socket.emit('update_tile', tile);
            console.log('UPDATE TILE CROP FERTILIZE -----------------------', tile);
          });
        });

      } else if (action_cleaned.indexOf("harvest") > -1){
        //TODO code that
        console.log('ACTION TILE CROP HARVEST -----------------------');
      }
  	});

	  socket.on('sync_tile', function(data) {
	  	Tile.update({x: data.x, y: data.y}, data, {}, function(err, tiles){
	  		if(err) console.log(err);
	  	});

	  	Tile.findOne({x: data.x, y: data.y}, function(err, tile){
  			socket.emit('update_tile', tile);
  			socket.broadcast.emit('update_tile', tile);
	  	});
	  });

	});

  return io;
};