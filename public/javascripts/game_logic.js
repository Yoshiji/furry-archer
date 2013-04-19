GameLogic = (function() {

  function GameLogic() {
  	// This constructor is called before the DOM is ready 
		// we call game_logic.init() when DOM is ready
    this.my_socket_id = 0;
    this.player_list = [];
    this.game_view = new GameView();
    this.game_chat = new GameChat();
  }

  GameLogic.prototype.init = function() {
  	this.connect();
  }

  GameLogic.prototype.connect = function() {
  	// IP a changer pour l'adresse du serveur (le client reçoit 'localhost', s'il n'est pas serveur le Chat ne marche pas)
		//var socket = this.socket = io.connect('http://localhost');
    if(window.location.href.indexOf('localhost') != -1){
      var url = 'http://localhost';
    } else {
      var url = 'http://192.168.2.32';
    }
    var socket = this.socket = io.connect(url);
    this.game_chat.init(socket);
    this.game_view.init(socket);

    // Work-around to keep the object's instance in instance's methods' functions
    var self = this;
  }

  

  GameLogic.prototype.reset = function() { }

  return GameLogic;
})();