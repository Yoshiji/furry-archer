Map = (function(){

	function Map(socket) {
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
      iso.centerAt(5,5);

      // TODO déterminer la zone de tile à demander en fonction de la position du joueur
      for(var i = 0; i < 20; i++) {
        for(var j = 0; j < 20; j++) {
          socket.emit('tile_request', {x: i, y: j});
        }
      }
      // TODO déterminer ou placer le player en fonction du user
      var player = Crafty.e('Player');
      iso.place(player, 0, 0, 2);
      Crafty.viewport.clampToEntities = false;
      Crafty.viewport.follow(player);
    });

    Crafty.scene("loading");

    // Réception et affichage d'une tile
    socket.on('tile', function(data){
      var tile = Crafty.e("Tile").addComponent(data.type);
      console.log(data, data.x, data.y);
      iso.place(tile, data.x, data.y, -1, true);
    });
	}


	Map.prototype.init = function() {

	}


	return Map;
})();