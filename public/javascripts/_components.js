
Crafty.c("Tile", {

  init: function() {
    this.owner_name = null;
    this.addComponent("2D, Canvas, Mouse").areaMap([0,16], [32,0], [64,16], [32,16]);
    this.addComponent("Collision").collision(new Crafty.polygon([0,64], [128,0], [256,64], [128,128]));
    this.addComponent("Socketed");
  },
  set_owner: function(owner_name) {
    this.owner_name = owner_name;
    this.removeComponent('grass').addComponent('my_grass');
    var socket = this.socket;
    attributes = { x: this._x, y: this._y, owner_name: this.owner_name };
    socket.emit('sync_tile', attributes);
  }

});


Crafty.c("Player", {

	init: function() {
    this.username = null;
    this._id = null;
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
        }
        if (direction.x > 0) {
            if (!this.isPlaying("walk_right"))
                this.stop().animate("walk_right", 1, -1);
        }
        if (direction.y < 0) {
            if (!this.isPlaying("walk_up"))
                this.stop().animate("walk_up", 1, -1);
        }
        if (direction.y > 0) {
            if (!this.isPlaying("walk_down"))
                this.stop().animate("walk_down", 1, -1);
        }
        if(!direction.x && !direction.y) {
            this.stop();
        }
      })
      .bind('Moved', function(from) {
        if(this.hit('water')){
          this.x = from.x;
          this.y = from.y;
        } else if(this.hit('grass')){
          tile = this.hit('grass')[0].obj;
          if(tile.owner_name != this.username) {
            tile.set_owner(this.username);
          }
        }
      })
      .collision(
        new Crafty.polygon([11,31], [12,31], [12,32], [11,32])
      );
			
		return this;
	},
  set_attributes: function(attributes) {
    this.username = attributes.username;
    this._id = attributes._id;

    return this;
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