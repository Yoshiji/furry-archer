Map = (function(){

	function Map() {
    Crafty.init();
    

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

      Crafty.viewport.init();
      Crafty.viewport.mouselook(false);

      iso = Crafty.diamondIso.init(64,32,20,20);
      iso.centerAt(5,5);

      for(var i = 0; i < 20; i++) {
        for(var j = 0; j < 20; j++) {
          var tile = Crafty.e("Tile");
          iso.place(tile, i, j, -1, true);
          
        }
      }
      iso.place(Crafty.e('Player, player2'), 0, 0, 2);
    });

    Crafty.scene("loading");   
	}


	Map.prototype.init = function() {

	}


	return Map;
})();