Map = (function(){
	function Map(socket) {
    this.tiles = {};
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
      var tile = Crafty.e("Tile").set_socket(socket);
      //var key = generateKey(data.x, data.y);
      data.id = tile[0]; // save id of the Crafty.element to keep it linked with the tiles hash

      if(data.owner_name == user.username)
        data.type = "my_grass";

      tile.addComponent(data.type);
      iso.place(data.x, data.y, 1, tile);
      self.setTileSettings(data, false); // save tile

      console.log("SET TILE", data, data.owner_name, user.username);
    });

    socket.on('update_tile', function(data){
      //var key = generateKey(data.x, data.y);

      if(self.getTileSettings(data)){
        data.id = self.getTileSettings(data).id; // keep id of the Crafty.element to keep it linked with the tiles hash

        if(data.owner_name == user.username)
          data.type = "my_grass";

        Crafty(data.id).removeComponent("grass, water, voided").addComponent(data.type);
        self.setTileSettings(data);

        console.log("UPDATE TILE", data, data.owner_name, user.username);
      }
    });

    socket.on('set_player', function(data){
      console.log("SET PLAYER", data);
      var player = this.player = Crafty.e('Player').set_socket(socket);
      user = data;
      iso.place(10, 10, 20, player);
      Crafty.viewport.follow(player);

      var pos_player = iso.px2pos(player.x, player.y);
      area = iso.area();

      for(var y = area.y.start; y <= area.y.end; y++){
        for(var x = area.x.start; x <= area.x.end; x++){
          socket.emit('get_tile', {x: x, y: y});
        }
      }
    });

    this.getTileSettings = function(data, inputIsInPx){
      var x = data.x;
      var y = data.y;
      if(inputIsInPx){
        var pos = iso.px2pos(x, y);
        x = pos.x;
        y = pos.y;
      }
      var key = "x" + x + "y" + y;
      if(self.tiles[key])
        return self.tiles[key];
      else
        return false;
    }

    this.setTileSettings = function(data, inputIsInPx){
      var x = data.x;
      var y = data.y;
      if(inputIsInPx){
        var pos = iso.px2pos(x, y);
        x = pos.left;
        y = pos.top;
      }
      var key = "x" + x + "y" + y;
      self.tiles[key] = data;
      return self.tiles[key];
    }

    return this;
	}


	return Map;
})();