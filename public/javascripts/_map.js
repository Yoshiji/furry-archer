
Map = {
  // ATTRIBUTES
  tiles: {},
  players: {},


  // METHODS

  update_player: function(data, socket) {
    this.players[data.user_id] = data;
    console.log('update_player #' + data.user_id);
  },

  update_actions: function(data, socket) {
    var actions = $("#actions").empty();
    for (var i = 0, len = data.length; i < len; i++) {
      var str = '<a href="#" class="action" data-action="'+ data[i][0] +'">'+ data[i][0]
      if(typeof data[i][1] != 'undefined')
        str += " (" + data[i][1] + ")";
      str += "</a>";

      actions.append(str);
    }
    $(".action", actions).click(function() { // bind events
      event.preventDefault();
      socket.emit("action", {action: $(this).data('action'), x: user.pos_x, y: user.pos_y});
    });
  },

  update_infos: function(user) {
    var infos = $('#infos').empty();
    var data = [];
    var ignored_keys = [ '__v', 'email', 'password', '_id', 'pos_x', 'pos_y', 'username' ];
    var keys = Object.keys(user);

    for (var i = 0; i < keys.length; i++) {
      if(ignored_keys.indexOf(keys[i]) == -1) {
        infos.append('<p><span>'+ keys[i] +":</span><span>"+ user[keys[i]] +"</span></p>");
      }
    }
  },

  update_tile: function(data, socket) {
    var tile_settings = this.set_tile_settings(data);

    if(tile_settings) {

      if(data.type != "voided" && data.type != "water" && data.owner_name != '-1'){
        if(data.owner_name == user.username)
          data.type = "my_";
        else
          data.type = "others_";

        if(tile_settings.crop && tile_settings.crop[0]){
          var maturity = tile_settings.crop[0].maturity || 0;
          var health = ((tile_settings.fertility + tile_settings.humidity) / 2) || 0;

          if(maturity > 99) maturity = 99;
          if(health > 99) health = 99;

          maturity = maturity - (maturity % 20);
          health = health - (health % 20);

          data.type = (data.type + maturity + "_" + health);

        } else {
          data.type += "grass";
        }
      }

      Crafty(tile_settings.id).sprite(tile_sprite_settings[data.type][0],tile_sprite_settings[data.type][1], tile_sprite_settings[data.type][2], tile_sprite_settings[data.type][3]);
      
      // ATTACK ANIMATION
      if(tile_settings.is_attacked) {
        console.log("ANIMATE -----------");
        Crafty(tile_settings.id).stop().animate("is_attacked", [[tile_sprite_settings[data.type][0], tile_sprite_settings[data.type][1]], [tile_sprite_settings["is_attacked"][0], tile_sprite_settings["is_attacked"][1]]]);
        Crafty(tile_settings.id).stop().animate("is_attacked", 48, -1); 
      } else {
        Crafty(tile_settings.id).stop().reset();
      }
    }
  },

  // GETTERs & SETTERs
  set_tile: function(data, socket) {
    var tile = Crafty.e("Tile").set_socket(socket);
    data.id = tile[0];

    tile.addComponent("tile_sprite");
    iso.place(data.x, data.y, 1, tile);
    this.update_tile(data, socket);
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
    var tile_settings = this.get_tile_settings(data);

    if(tile_settings && tile_settings.id){
      data.id = tile_settings.id;
    }

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
    this.update_infos(user);
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

    socket.on('update_infos', function(data) {
      self.update_infos(data);
    });

    socket.on('update_tile_sprite', function(data) {
      self.update_tile_sprite(data, this);
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