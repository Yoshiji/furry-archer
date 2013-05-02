
Crafty.c("Tile", {

  init: function() {
    this.addComponent("2D, Canvas, grass, Mouse").areaMap([0,32], [64,0], [128,32], [64,64]);

    this.bind('Click', function(event) {
    	
    });
  }

});