var game_logic = new GameLogic();
var game_view = new GameView();

function init_game() {
  game_logic.reset();
  game_view.init();
}


$(document).ready(function() {
  //remove flash messages after an amount of time
  $(".flash").delay(2000).fadeOut(1000, "easeInExpo");
  $(".flash").click(function(){
    $(this).stop(true, true).fadeOut(300, "easeInExpo");
  });

  
  
  init_game();
  
});