
// Triggered when the DOM is ready
$(document).ready(function() {

  handle_flash_messages();
  init_game();

});

// Implicit instanciation of GameChat and GameView
// in the GameLogic constructor
var game_logic = new GameLogic();
SCREEN_SIZE = {};
// Should be called only when the DOM is ready
function init_game() {
  SCREEN_SIZE = {
    height: $("#game_board").height(),
    width: $("#game_board").width()
  }
  
  game_logic.init();
}

function handle_flash_messages() {
  //remove flash messages after an amount of time
  $(".flash").delay(2000).fadeOut(1000, "easeInExpo");
  $(".flash").click(function(){
    $(this).stop(true, true).fadeOut(300, "easeInExpo");
  });
}

function resizedw(){
  sheetengine.canvas.width = sheetengine.canvas.clientWidth;
  sheetengine.canvas.height = sheetengine.canvas.clientHeight;

  sheetengine.calc.calculateAllSheets();
  sheetengine.drawing.drawScene(true);
}

var doit;
$(window).resize(function(){
  clearTimeout(doit);
  doit = setTimeout(resizedw, 300);
});