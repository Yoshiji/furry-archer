var socketio = require('socket.io');

module.exports.listen = function(app){
  io = socketio.listen(app);

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
	        socket.emit('set_tile', -1);
	      }
	    });
	  });

	});

    return io;
};