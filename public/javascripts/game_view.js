GameView = (function() {
  
  function GameView() {}

  GameView.prototype.init = function() {
    this.game_board = $('#game_board');
    this.game_chat = new GameChat();
    this.draw_tiles();
  };

  GameView.prototype.reset = function() {
  };

  GameView.prototype.draw_tiles = function() {
    this.game_chat.write_message('System', 'Drawing tiles !');
  };


  return GameView;
})();