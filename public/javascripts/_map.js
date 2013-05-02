Map = (function(){

	function Map() {
    Crafty.init();
    Crafty.canvas.init();
    
    Crafty.viewport.init();
    Crafty.viewport.mouselook(false);

    iso = Crafty.diamondIso.init(128,64,10,10);
    iso.centerAt(0,0);

    for(var i = 0; i < 10; i++) {
      for(var j = 0; j < 10; j++) {
        var tile = Crafty.e("Tile");
        iso.place(tile, i, j, 0);
      }
    }
    
    iso.place(Crafty.e('Player, player5'), 3, 3, 2);
    iso.place(Crafty.e('Player, player7'), 3, 0, 2);
    iso.place(Crafty.e('Player, player6'), 0, 0, 2);
    iso.place(Crafty.e('Player, player8'), 0, -1, 2);

    for(var i = 1; i < 8; i++) {
      iso.place(Crafty.e('Player, player1'), 0, i, 2);
    }
	}


	Map.prototype.init = function() {

	}


	return Map;
})();