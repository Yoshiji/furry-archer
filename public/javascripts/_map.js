Map = (function(){
	function Map(socket) {
    this.tiles = [];
    this.player = null;
    var self = this;

    Crafty.init(800,600);

    
    Crafty.scene("loading", function() {
      Crafty.load(["images/grasstile.png", "images/players.png"], function() {
        Crafty.scene("main");
      });
      Crafty.e("2D, DOM, Text")
        .attr({ w: 100, h: 20, x: 150, y: 120 })
        .text("Loading...")
        .css({ "text-align": "center" });
    });

    Crafty.scene("main", function() {
      Crafty.canvas.init();

      iso = Crafty.isometric.size(256);

      Crafty.viewport.init(800,600);
      Crafty.viewport.mouselook(false);
      Crafty.viewport.clampToEntities = false;


      socket.emit('get_player');

    });

    Crafty.scene("loading");

    // Réception et affichage d'une tile
    socket.on('set_tile', function(data){
      var tile = Crafty.e("Tile").addComponent(data.type).set_socket(socket);
      iso.place(data.x, data.y, 1, tile);
      self.tiles.push(tile);
    });

    socket.on('set_player', function(data){
      var player = this.player = Crafty.e('Player').set_socket(socket).set_attributes(data);
      
      iso.place(10, 10, 20, player);
      Crafty.viewport.follow(player);

      var pos_player = iso.px2pos(player.x, player.y);
      var area = iso.area();

      for(var y = area.y.start; y <= area.y.end; y++){
        for(var x = area.x.start; x <= area.x.end; x++){
            socket.emit('get_tile', {x: x, y: y});
        }
      }
    });

    return this;
	}


	return Map;
})();