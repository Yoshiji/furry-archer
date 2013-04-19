
// Triggered when the DOM is ready
$(document).ready(function() {

  handle_flash_messages();
  init_game();
  
});

// Implicit instanciation of GameChat and GameView
// in the GameLogic constructor
var game_logic = new GameLogic();

// Should be called only when the DOM is ready
function init_game() {
  game_logic.init();
}

function handle_flash_messages() {
  //remove flash messages after an amount of time
  $(".flash").delay(2000).fadeOut(1000, "easeInExpo");
  $(".flash").click(function(){
    $(this).stop(true, true).fadeOut(300, "easeInExpo");
  });
}