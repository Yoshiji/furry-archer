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
	  	console.log(socket.session.user);
	  	socket.emit('set_player', socket.session.user);
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