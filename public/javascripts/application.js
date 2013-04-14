var game_logic = new GameLogic();
var game_view = new GameView();

function init_game() {
  game_logic.reset();
  game_view.init();
}


$(document).ready(function() {
  //remove flash messages after an amount of time
  $(".flash").delay(2000).slideUp(600, "easeOutCirc");
  
  init_game();
  
});