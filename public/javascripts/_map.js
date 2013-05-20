Map = (function(){
	function Map(socket) {
    this.tiles = [];
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

      //Crafty.viewport.init(800,600);
      Crafty.viewport.mouselook(false);

      iso = Crafty.isometric.size(256);
      //iso = Crafty.diamondIso.init(256,128,20,20);
      //iso.centerAt(5,5);

      // TODO déterminer ou placer le player en fonction du user
      var player = Crafty.e('Player');
      iso.place(10, 10, 20,player);
      Crafty.viewport.clampToEntities = false;
      Crafty.viewport.follow(player);

      console.log(iso.px2pos(player.x, player.y),player.z);
      var pos_player = iso.px2pos(player.x, player.y);
      var area = iso.area();
      for(var y = area.y.start; y <= area.y.end; y++){
        for(var x = area.x.start; x <= area.x.end; x++){
            //iso.place(x,y,0,Crafty.e("2D,DOM,gras")); //Display tiles in the Screen
            socket.emit('get_tile', {x: x, y: y});
        }
      } 
      // for(var i = 0; i < 20; i++) {
      //   for(var j = 0; j < 20; j++) {
      //     socket.emit('get_tile', {x: i, y: j});
      //   }
      // }

    });

    Crafty.scene("loading");

    // Réception et affichage d'une tile
    socket.on('set_tile', function(data){
      var tile = Crafty.e("Tile").attr({w:256,h:128}).addComponent(data.type);
      if(data && data.type == "water"){
        tile.addComponent("Collision").collision(
          new Crafty.polygon([0,64], [128,0], [256,64], [128,128])
        );
      }
      console.log(data, data.x, data.y);
      iso.place(data.x, data.y, 1, tile);
      console.log(iso.px2pos(tile.x, tile.y), tile.z);
      //Crafty.viewport.follow(tile);
      self.tiles.push(tile);
    });

    return this;
	}


	Map.prototype.init = function() {

	}


	return Map;
})();