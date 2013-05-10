
Crafty.c("Tile", {

  init: function() {
    this.addComponent("2D, Canvas, smallgrass, Mouse").areaMap([0,16], [32,0], [64,16], [32,16]);

    this.bind('Click', function(event) {
    	
    });
  }

});


Crafty.c("Player", {

	init: function() {
		this.addComponent("2D, Canvas, Mouse, Multiway");
		this.multiway(1, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
		
		this.bind('Click', function(event){
			
		});
	}
})