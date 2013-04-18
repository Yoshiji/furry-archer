var socket = io.connect('http://localhost:3000');

socket.on("connection",function(data){
  console.log('Connected to the server through Socket.io!');
});

var game_logic = new GameLogic();
var game_view = new GameView();


socket.on("chat_message",function(msg){
  console.log('msg received');
  //game_view.game_chat.write_message(msg.author, msg.message);
});

$(document).ready(function() {

  //remove flash messages after an amount of time
  $(".flash").delay(2000).fadeOut(1000, "easeInExpo");
  $(".flash").click(function(){
    $(this).stop(true, true).fadeOut(300, "easeInExpo");
  });

  $("#game_chat #new_message input[type='button']").click(function(){
    alert("chat");
    game_chat.send_message
  });
  
  init_game();
  
});



function init_game() {
  game_logic.reset();
  game_view.init();
}

