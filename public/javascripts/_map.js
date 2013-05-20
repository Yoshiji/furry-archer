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
      Crafty.viewport.init(800,600);
      Crafty.viewport.mouselook(false);

      iso = Crafty.diamondIso.init(256,128,20,20);

      // TODO déterminer la zone de tile à demander en fonction de la position du joueur
      for(var i = 0; i < 20; i++) {
        for(var j = 0; j < 20; j++) {
          socket.emit('get_tile', {x: i, y: j});
        }
      }

      socket.emit('get_player');

      Crafty.viewport.clampToEntities = false;
    });

    Crafty.scene("loading");

    // Réception et affichage d'une tile
    socket.on('set_tile', function(data){
      var tile = Crafty.e("Tile").addComponent(data.type);
      //console.log(data, data.x, data.y);
      iso.place(tile, data.x, data.y, -1);
      self.tiles.push(tile);
    });

    socket.on('set_player', function(data){
      var player = this.player = Crafty.e('Player').set_socket(socket).set_attributes(data);
      iso.place(player, 0, 0, 2);
      Crafty.viewport.follow(player);
    });

    return this;
	}


	return Map;
})();