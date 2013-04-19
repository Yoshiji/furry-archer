GameChat = (function() {

  function GameChat() {
    // This constructor is called when we make an instance of GameLogic, 
    // which is called on the DOM ready (all HTML elements will be fully loaded)
    this.form = $('#game_chat_form');
    this.chat_board = $('#game_chat');
    this.message_template = $('#message_template', this.chat_board);
    this.new_message = $('#new_message', this.chat_board);
    this.socket = null;
  }

  GameChat.prototype.init = function(socket) {
    // This is called when the socket is connected
    this.socket = socket;
    // Work-aroung to represents the object's instance inside functions
    var self = this;

    this.socket.on('chat_message', function(data){
      self.write_message(data.author, data.message);
    });

    this.form.on('submit', function(e){
      e.preventDefault(); // prevent from firing the submit event of the form
      self.send_chat_message();
    });
  }

  GameChat.prototype.send_chat_message = function() {
  	var message = $('#message', this.new_message).val();
    if(message == ''){ alert('Message vide, abrutis !');return; };
    $('#message', this.new_message).val('');
  	this.socket.emit('chat_message', message);
  }

  GameChat.prototype.write_message = function(author, message) {
  	var new_message = this.message_template.clone();
  	$('.author', new_message).text(author);
  	$('.message', new_message).text(message);
  	$(new_message).removeClass('hidden');
  	$(new_message).addClass('message');
  	$('#conversation', this.chat_board).append(new_message);
    $('#conversation', this.chat_board).scrollTop($('#conversation', this.chat_board)[0].scrollHeight);
  }


  GameChat.prototype.reset = function() { $("p:not(#header)",chat_board).empty().append(this.new_message); }
  
  return GameChat;
})();