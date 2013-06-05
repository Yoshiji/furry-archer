Crafty.c("Tile", {

  init: function() {
    this.addComponent("2D, Canvas")
    this.addComponent("Collision").collision(new Crafty.polygon([0,84], [128,20], [256,84], [128,148]));
    this.addComponent("Socketed");
  }
  
});

Crafty.c("Player", {

	init: function() {
    this.username = null;
    this._id = null;
		this.addComponent("2D, Canvas, player2, SpriteAnimation, Fourway, SolidHitBox, Collision, Socketed");
		this.animate('walk_left', [[9,12],[15,12]]);
		this.animate('walk_right', [[9,4],[15,4]]);
		this.animate('walk_up', [[9,0],[15,0]]);
		this.animate('walk_down', [[9,8],[15,8]]);
    this.fourway(5);
    this.collision(new Crafty.polygon([11,31], [12,31], [12,32], [11,32]));

    this.bind('NewDirection', function(direction) {
      if (direction.x < 0) {
        if (!this.isPlaying("walk_left"))
          this.stop().animate("walk_left", 1, -1);
      } else if (direction.x > 0) {
        if (!this.isPlaying("walk_right"))
          this.stop().animate("walk_right", 1, -1);
      } else if (direction.y < 0) {
        if (!this.isPlaying("walk_up"))
          this.stop().animate("walk_up", 1, -1);
      } else if (direction.y > 0) {
        if (!this.isPlaying("walk_down"))
          this.stop().animate("walk_down", 1, -1);
      }
      if(!direction.x && !direction.y) {
        this.stop();
      }
    });

    this.bind('WalkingOnNewTile', function(tile) { 
      var tile_settings = map.get_tile_settings({x: tile._x, y: tile._y}, true);
      var data = { user_id: user._id, pos_x: tile_settings.x, pos_y: tile_settings.y };
    
      user.pos_x = tile_settings.x;
      user.pos_y = tile_settings.y;

      this.socket.emit('update_player', data);
      
      var tile_info = 'Tile settings before update:<br/>'
      var keys = Object.keys(tile_settings).sort();
      for(var i = 0; i < keys.length; i++) {
        tile_info += '- ' + keys[i] + ': ' + tile_settings[keys[i]] + '<br/>';
      }
      $('#debug').empty().append(tile_info);
    });

    this.bind('Moved', function(from) {
      if (this.hit('tile_sprite')) {
        var tile = this.hit('tile_sprite')[0].obj;
        var tile_type = map.get_tile_settings(tile, true).type;

        if (tile_type == 'voided' || tile_type == 'water') {
          this.x = from.x;
          this.y = from.y;
        } else {
          this.check_new_tile(tile); 
        }
      }
      this.reload_area();
    });
    
			
		return this;
	},

  check_new_tile: function(tile) {
    var pos = iso.px2pos(tile._x, tile._y);
    if(user.pos_x != pos.x || user.pos_y != pos.y) {
      Crafty.trigger('WalkingOnNewTile', tile);
    }
  },

  reload_area: function() {
    var new_area = iso.area();
    if(area.x.start != new_area.x.start || area.x.end != new_area.x.end || area.y.start != new_area.y.start || area.y.end != new_area.y.end){
      area = new_area;
      var map_size = map.tiles.length;

      for(var y = area.y.start; y <= area.y.end; y++){
        for(var x = area.x.start; x <= area.x.end; x++){
          if(!map.get_tile_settings({x: x,y: y}))
            this.socket.emit('get_tile', {x: x, y: y});
        }
      }
    }
  }
});

Crafty.c("Socketed", {
  init: function() {
    this.socket = null;
    return this;
  },
  set_socket: function(socket) {
    this.socket = socket;
    return this;
  }
});