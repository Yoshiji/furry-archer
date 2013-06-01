
Map = {
  // ATTRIBUTES
  tiles: {},
  players: {},


  // METHODS
  update_tile: function(data, socket) {
    var tile_settings = this.get_tile_settings(data);
    if(tile_settings) {
      data.id = tile_settings.id;

      if(data.owner_name == user.username)
        data.type = "my_grass";
      else
        data.type = "others_grass";

      Crafty(data.id).sprite(tile_sprite_settings[data.type][0],tile_sprite_settings[data.type][1], tile_sprite_settings[data.type][2], tile_sprite_settings[data.type][3]);
      this.set_tile_settings(data);
    }
  },

  update_player: function(data, socket) {
    this.players[data.user_id] = data;
    console.log('update_player #' + data.user_id);
  },

  update_actions: function(data, socket) {
    $("#actions").empty();
    for (var i = 0, len = data.length; i < len; i++) {
      $("#actions").append('<a href="#" class="action">' + data[i] + "</a>");
    }
    $(".action").click(function() { // bind events
      event.preventDefault();
      socket.emit("action", {action: $(this).text(), x: user.pos_x, y: user.pos_y});
    });
  },


  // GETTERs & SETTERs
  set_tile: function(data, socket) {
    var tile = Crafty.e("Tile").set_socket(socket);
    data.id = tile[0];

    if(data.owner_name == user.username) {
      data.type = "my_grass";
    }

    tile.addComponent("tile_sprite").sprite(tile_sprite_settings[data.type][0],tile_sprite_settings[data.type][1], tile_sprite_settings[data.type][2], tile_sprite_settings[data.type][3]);

    iso.place(data.x, data.y, 1, tile);
    this.set_tile_settings(data, false);
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
  },
  

  // INIT METHODS
  init: function(socket) {
    Crafty.init(800,600);
    this.init_scenes(socket);
    Crafty.scene("loading");
    this.init_sockets(socket);

    return this;
  },

  init_player: function(data, socket) {
    var player = this.player = Crafty.e('Player').set_socket(socket);
    Crafty.addEvent(player, Crafty.stage.elem, 'WalkingOnNewTile');
    iso.place(data.pos_x, data.pos_y, 20, player);
    Crafty.viewport.follow(player);
    player.x += (128 - 12);
    player.y += (74 - 16);
    data.pos_x = -10; //Workaround to trigger 'Moved' as soon as we first walk
    user = data;
    this.init_tiles_around_me(socket, player);
  },

  init_tiles_around_me: function(socket, player) {
    area = iso.area();
    for(var y = area.y.start; y <= area.y.end; y++) {
      for(var x = area.x.start; x <= area.x.end; x++) {
        socket.emit('get_tile', {x: x, y: y});
      }
    }
    player.trigger('Moved', {x: player.x, y: player.y});
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
      self.init_player(data, this);
    });

    socket.on('update_player', function(data) {
      self.update_player(data, this);
    });

    socket.on('update_actions', function(data) {
      self.update_actions(data, this);
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
  }
}