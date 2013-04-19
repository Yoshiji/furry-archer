GameView = (function() {
  
  function GameView() {
    // This constructor is called when we make an instance of GameLogic, 
    // which is called on the DOM ready (all HTML elements will be fully loaded)
    this.game_board = $('#game_board');
    this.socket = null;
  }

  GameView.prototype.init = function(socket) {
    // This is called when the socket is connected
    this.socket = socket;
  }



  GameView.prototype.reset = function() {  }

  return GameView;
})();