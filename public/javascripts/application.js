
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


function resizedw(){
  $("div#game_hidder").fadeIn(200);
  var time = setTimeout(function(){
    sheetengine.canvas.width = sheetengine.canvas.clientWidth;
    sheetengine.canvas.height = sheetengine.canvas.clientHeight;
    sheetengine.calc.calculateAllSheets();
    sheetengine.drawing.drawScene(true);
    $("div#game_hidder").delay(30).fadeOut(400);
    faddedIn = false;
  }, 210);

}

var doit;
var faddedIn = false
$(window).resize(function(){
  if(!faddedIn){
    $("div#game_hidder").stop(true, true).fadeIn(200);
    faddedIn = true;
  }
  clearTimeout(doit);
  doit = setTimeout(resizedw, 300);
});


var lastScrollTop = 0;
var zoom = 1;
$(window).scroll(function(event){
  alert("chat")
  var st = $(this).scrollTop();
  if (st > lastScrollTop){
    //downscroll
    zoom = zoom*0.9;
    sheetengine.context.scale(zoom,zoom);
    sheetengine.context.translate(-sheetengine.canvas.clientWidth/(2*zoom)*(zoom-1),-sheetengine.canvas.clientHeight/(2*zoom)*(zoom-1));
  } else {
    //upscroll
    zoom = zoom*1.1;
    sheetengine.context.scale(zoom,zoom);
    sheetengine.context.translate(-sheetengine.canvas.clientWidth/(2*zoom)*(zoom-1),-sheetengine.canvas.clientHeight/(2*zoom)*(zoom-1));
  }
  lastScrollTop = st;
});