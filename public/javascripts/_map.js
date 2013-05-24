
Map = {
  // ATTRIBUTES
  tiles: {},

  // METHODS
  update_tile: function(data, socket) {
    var tile_settings = this.get_tile_settings(data);
    if(tile_settings) {
      data.id = tile_settings.id; // keep id of the Crafty.element to keep it linked with the tiles hash

      if(data.owner_name == user.username)
        data.type = "my_grass";
      else // bizarre, parfois set to others_grass quand on marche dessus !
        data.type = "others_grass";

      Crafty(data.id).removeComponent("grass, water, voided, my_grass, others_grass").addComponent(data.type);
      this.set_tile_settings(data);

      //console.log("UPDATING TILE #" + data.id);
    }
  },

  // INIT METHODS
  init: function(socket) {
    Crafty.init(800,600);
    this.init_scenes(socket);
    Crafty.scene("loading");
    this.init_sockets(socket);

    return this;
  },

  init_sockets: function(socket) {
    var self = this;

    socket.on('update_tile', function(data){
      self.update_tile(data, this);
    });

    socket.on('set_tile', function(data) {
      self.set_tile(data, this);
    });

    socket.on('set_player', function(data){
      self.set_player(data, this);
    });
  },

  init_scenes: function(socket) {
    Crafty.scene("loading", function() {
      var percents = Crafty.e("2D, DOM, Text").attr({w:100, h:20, x:150, y:140}).text("0%").css({"text-align": "center"});

      Crafty.load(["images/grasstile.png", "images/players.png"],
        function() {
          Crafty.scene("main");
        },
        function(e) { // in progress
          percents.text(""+e.percent+"%");
        }
      );
      Crafty.e("2D, DOM, Text").attr({w:100, h:20, x:150, y:120}).text("Loading...").css({"text-align": "center"});
    });

    Crafty.scene("main", function() {
      Crafty.canvas.init();

      iso = Crafty.isometric.size(256);

      Crafty.viewport.init(800,600);
      Crafty.viewport.mouselook(false);
      Crafty.viewport.clampToEntities = false;

      socket.emit('get_player');
    });
  },

  // GETTERs & SETTERs
  set_player: function(data, socket) {
    //console.log("SETTING PLAYER " + data.username);

    var player = this.player = Crafty.e('Player').set_socket(socket);
    Crafty.addEvent(player, Crafty.stage.elem, 'WalkingOnNewTile');
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
  },

  set_tile: function(data, socket) {
    var tile = Crafty.e("Tile").set_socket(socket);
    //var key = generateKey(data.x, data.y);
    data.id = tile[0]; // save id of the Crafty.element to keep it linked with the tiles hash

    if(data.owner_name == user.username)
      data.type = "my_grass";

    tile.addComponent(data.type);
    iso.place(data.x, data.y, 1, tile);
    this.set_tile_settings(data, false); // save tile

    //console.log("SETTING TILE #" + data.id);
  },

  get_tile_settings: function(data, inputIsInPx) {
    var x = data.x;
    var y = data.y;
    if(inputIsInPx){
      var pos = iso.px2pos(x, y);
      x = pos.x;
      y = pos.y;
    }
    var key = "x" + x + "y" + y;
    if(this.tiles[key])
      return this.tiles[key];
    else
      return false;
  },

  set_tile_settings: function(data, inputIsInPx) {
    var x = data.x;
    var y = data.y;
    if(inputIsInPx){
      var pos = iso.px2pos(x, y);
      x = pos.left;
      y = pos.top;
    }
    var key = "x" + x + "y" + y;
    this.tiles[key] = data;
    return this.tiles[key];
  }
}