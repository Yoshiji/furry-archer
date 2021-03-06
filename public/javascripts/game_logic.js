GameLogic = (function () {
  function GameLogic() {
    // This constructor is called BEfORE the DOM is ready
    this.socket = null;
    this.player_list = [];
    this.game_chat = null;
  }

  GameLogic.prototype.init = function () {
    // we call game_logic.init() when DOM is ready
    this.game_chat = new GameChat();
    this.connect();
  };

  GameLogic.prototype.connect = function () {
    // IP a changer pour l'adresse du serveur (le client reçoit 'localhost', s'il n'est pas serveur le Chat ne marche pas)
    //var socket = this.socket = io.connect('http://localhost');
    if (window.location.href.indexOf("localhost") != -1) {
      var url = "http://localhost";
    } else {
      var url = "http://192.168.2.30";
    }
    var socket = (this.socket = io.connect(url));
    this.game_chat.init(socket);
    map = Map.init(socket);
  };

  GameLogic.prototype.reset = function () {};

  return GameLogic;
})();
