GameView = (function() {
  
  function GameView() {
    // This constructor is called when we call init() of GameLogic, 
    // which is called on the DOM ready (all HTML elements will be fully loaded)
    this.socket = null;
    this.map = null;
  }

  GameView.prototype.init = function(socket) {
    // This is called when the socket is connected
    this.socket = socket;
    this.map = new Map(this.socket);
  }



  GameView.prototype.reset = function() {  }

  return GameView;
})();