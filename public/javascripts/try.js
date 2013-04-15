function init() {
  // initialize the sheetengine
  var canvasElement = document.getElementById('game_board');
  sheetengine.scene.init(canvasElement, {w:600,h:400});
  
  // define a basesheet
  sheetengine.scene.tilewidth = 200;
  var basesheet = new sheetengine.BaseSheet({x:0,y:0,z:0}, {alphaD:90,betaD:0,gammaD:0}, {w:200,h:200});
  basesheet.color = '#70a050';

  // define a custom object
  var sheet1 = new sheetengine.Sheet({x:0,y:-14,z:14}, {alphaD:45,betaD:0,gammaD:0}, {w:40,h:40});
  sheet1.context.fillStyle='#F00';
  sheet1.context.fillRect(0,0,40,40);
  sheet1.context.clearRect(10,10,20,20);

  var sheet2 = new sheetengine.Sheet({x:0,y:14,z:14}, {alphaD:-45,betaD:0,gammaD:0}, {w:40,h:40});
  sheet2.context.fillStyle='#FFF';
  sheet2.context.fillRect(0,0,40,40);
  sheet2.context.clearRect(10,10,20,20);

  var obj = new sheetengine.SheetObject({x:-50,y:-50,z:0}, {alphaD:0,betaD:0,gammaD:0}, [sheet1, sheet2], {w:80,h:80,relu:40,relv:50});
  
  sheetengine.calc.calculateChangedSheets();
  sheetengine.drawing.drawScene(true);
  
  // move object around
  var maxsteps = 20;
  var steps = 0;
  var direction = {x:5, y:0, z:0};
  var rotate = false;
  setInterval(function() {
    if (rotate) {
      obj.rotate({x:0, y:0, z: 1}, Math.PI/2/maxsteps);
      if (++steps >= maxsteps) {
        steps = 0;
        rotate = false;
      }
    } else {
      obj.move(direction);
      if (++steps >= maxsteps) {
        if (direction.x == 5) { direction.x = 0; direction.y = 5; }
        else if (direction.y == 5) { direction.x = -5; direction.y = 0; }
        else if (direction.x == -5) { direction.x = 0; direction.y = -5; }
        else if (direction.y == -5) { direction.x = 5; direction.y = 0; }
        steps = 0;
        rotate = true;
      }
    }
	
    // calculate sheets and draw scene
    sheetengine.calc.calculateChangedSheets();
    sheetengine.drawing.drawScene();
  }, 30);
};

init();