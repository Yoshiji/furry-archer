
Crafty.c("Tile", {

  init: function() {
    this.addComponent("2D, Canvas, smallgrass, Mouse").areaMap([0,16], [32,0], [64,16], [32,16]);

    this.bind('Click', function(event) {
    	
    });
  }

});


Crafty.c("Player", {

	init: function() {
		this.addComponent("2D, Canvas, Mouse, Sprite, SpriteAnimation, Collision, CustomControls, Controls, player2")
			.animate('walk_left', [[9,12],[12,12],[15,12]])
			.animate('walk_right', [[9,4],[12,4],[15,4]])
			.animate('walk_up', [[9,0],[12,0],[15,0]])
			.animate('walk_down', [[9,8],[12,8],[15,8]])
			.CustomControls(1)
			.bind("EnterFrame", function(e) {
		    if (this.__move.left) {
		      if (!this.isPlaying("walk_left"))
		        this.stop().animate("walk_left", -1);
		    }
		    if (this.__move.right) {
		      if (!this.isPlaying("walk_right"))
		        this.stop().animate("walk_right", -1);
		    }
		    if (this.__move.up) {
		      if (!this.isPlaying("walk_up"))
		        this.stop().animate("walk_up", -1);
		    }
		    if (this.__move.down) {
		      if (!this.isPlaying("walk_down"))
		        this.stop().animate("walk_down", -1);
		    }
		  })
		  .bind("KeyUp", function(e) {
		    this.stop();
		  })
		  .bind('Click', function(e){
			});
			
		return this;
	}
});


Crafty.c('CustomControls', {
  __move: {left: false, right: false, up: false, down: false},    
  _speed: 1,

  CustomControls: function(speed) {
    if (speed) this._speed = speed;
    var move = this.__move;

    this.bind('EnterFrame', function() {
      if (move.right) this.x += this._speed; 
      else if (move.left) this.x -= this._speed; 
      else if (move.up) this.y -= this._speed;
      else if (move.down) this.y += this._speed;
    })
    .bind('KeyDown', function(e) {
      move.right = move.left = move.down = move.up = false;

      if (e.keyCode === Crafty.keys.RIGHT_ARROW) move.right = true;
      if (e.keyCode === Crafty.keys.LEFT_ARROW) move.left = true;
      if (e.keyCode === Crafty.keys.UP_ARROW) move.up = true;
      if (e.keyCode === Crafty.keys.DOWN_ARROW) move.down = true;
    })
    .bind('KeyUp', function(e) {
      if (e.keyCode === Crafty.keys.RIGHT_ARROW) move.right = false;
      if (e.keyCode === Crafty.keys.LEFT_ARROW) move.left = false;
      if (e.keyCode === Crafty.keys.UP_ARROW) move.up = false;
      if (e.keyCode === Crafty.keys.DOWN_ARROW) move.down = false;
    });

    return this;
  }
});