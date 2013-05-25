
Crafty.c("Tile", {

  init: function() {
    this.addComponent("2D, Canvas, Mouse").areaMap([0,16], [32,0], [64,16], [32,16]);
    this.addComponent("Collision").collision(new Crafty.polygon([0,64], [128,0], [256,64], [128,128]));
    this.addComponent("Socketed");
  },

  set_owner: function(owner) {
    var attributes = iso.px2pos(this._x, this._y);
    attributes.owner_name = owner.username;
    var tile_settings = map.get_tile_settings(attributes, true);
    tile_settings.owner_name = owner.username;
    tile_settings.owner_id = owner._id;
    console.log("SETING OWNER");
    this.socket.emit('sync_tile', attributes);
  }
});

Crafty.c("Player", {

	init: function() {
    this.username = null;
    this._id = null;
    this.current_pos = {x: 0, y: 0};
		this.addComponent("2D, Canvas, player2, SpriteAnimation, Fourway, SolidHitBox, Collision, Socketed")
			.animate('walk_left', [[9,12],[15,12]])
			.animate('walk_right', [[9,4],[15,4]])
			.animate('walk_up', [[9,0],[15,0]])
			.animate('walk_down', [[9,8],[15,8]])
      .fourway(5)
      .bind('NewDirection', function(direction) {
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
      })
      .bind('WalkingOnNewTile', function(tile) {
        console.log('Walking On a New Tile!');
        this.socket.emit('update_player', {user_id: user._id, current_pos: this.current_pos});
        
        if(map.get_tile_settings({x: tile._x, y: tile._y}, true).owner_name != user.username)
          tile.set_owner(user);
      })
      .bind('Moved', function(from) {
        if(this.hit('grass')) {
          var tile = this.hit('grass')[0].obj;
          this.check_new_tile(tile);

        } else if(this.hit('my_grass')) {
          var tile = this.hit('my_grass')[0].obj;
          this.check_new_tile(tile);

        } else if(this.hit('others_grass')) {
          var tile = this.hit('others_grass')[0].obj;
          this.check_new_tile(tile);

        } else if(this.hit('voided') || this.hit('water')) {
          this.x = from.x;
          this.y = from.y;
        }
        
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
      })
      .collision(
        new Crafty.polygon([11,31], [12,31], [12,32], [11,32])
      );
			
		return this;
	},

  check_new_tile: function(tile) {
    var pos = iso.px2pos(tile._x, tile._y);
    this.current_pos = this.current_pos || pos;
    if(this.current_pos.x != pos.x || this.current_pos.y != pos.y) {
      this.current_pos = pos;
      Crafty.trigger('WalkingOnNewTile', tile);
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