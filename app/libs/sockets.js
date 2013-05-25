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
	  		if(err)
	  			console.log(err);
	  	});
	  	socket.broadcast.emit('update_player', data);
	  });

	  socket.on('sync_tile', function(data) {
	  	Tile.update({x: data.x, y: data.y}, data, {}, function(err, tiles){
	  		if(err)
	  			console.log(err);
	  	});

	  	Tile.find({x: data.x, y: data.y}, function(err, tiles){
	  		if(tiles.length > 0) {
	  			var tile = tiles[0];
	  			socket.emit('update_tile', tile);
	  			socket.broadcast.emit('update_tile', tile);
	  		}
	  	});
	  });

	});

  return io;
};