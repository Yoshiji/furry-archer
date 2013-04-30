Map = (function(){

	function Map() {
		// initialize the sheetengine
		var canvasElement = document.getElementById('game_board');
		// init dynamic canvas with a 2000x1500 pixel background buffer
		sheetengine.scene.init(canvasElement, {w:2000,h:1600});
		var zoom = 0.4;
		sheetengine.context.scale(zoom,zoom);
		sheetengine.context.translate(-sheetengine.canvas.width/(2*zoom)*(zoom-1),-sheetengine.canvas.height/(2*zoom)*(zoom-1));
		// define some basesheets
		this.tiles = [];
      for (var x=-1; x<=1; x++) {
        for (var y=-1; y<=1; y++) {
        	var tile = new Tile(x, y);
        	this.tiles.push([tile.coords.x, tile.coords.y]);
        }
      }
    // define some sheets: create a white box
      var sheet1 = new sheetengine.Sheet({x:150,y:20,z:20}, {alphaD:0,betaD:0,gammaD:0}, {w:40,h:40});
      sheet1.context.fillStyle = '#FFF';
      sheet1.context.fillRect(0,0,40,40);

      var sheet2 = new sheetengine.Sheet({x:170,y:0,z:20}, {alphaD:0,betaD:0,gammaD:90}, {w:40,h:40});
      sheet2.context.fillStyle = '#FFF';
      sheet2.context.fillRect(0,0,40,40);

      var sheet3 = new sheetengine.Sheet({x:150,y:0,z:40}, {alphaD:90,betaD:0,gammaD:0}, {w:40,h:40});
      sheet3.context.fillStyle = '#FFF';
      sheet3.context.fillRect(0,0,40,40);
      
      
      // define some sheets: create a pine tree
      var sheet4 = new sheetengine.Sheet({x:-150,y:-120,z:40}, {alphaD:0,betaD:0,gammaD:0}, {w:80,h:80});
      var sheet5 = new sheetengine.Sheet({x:-150,y:-120,z:40}, {alphaD:0,betaD:0,gammaD:90}, {w:80,h:80});

      // draw the scene
      sheetengine.calc.calculateAllSheets();
      sheetengine.drawing.drawScene(true);


	}

	Map.prototype.init = function() {

	}

	return Map;
})();