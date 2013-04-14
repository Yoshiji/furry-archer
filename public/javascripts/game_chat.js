GameChat = (function() {

  function GameChat() {
  	self = this;
  	this.chat_board = $('#game_chat');
    this.message_template = $('#message_template');
    this.tr_new_message = $('tr#new_message');
    $('#submit', this.tr_new_message).on( 'click', function(){self.send_message()} );
    socket.on('chat_message', function(data){
      self.write_message(data.author, data.message);
    })
  }

  GameChat.prototype.reset = function() {
    $('tbody', chat_board).empty().append(new_message);
  }

  GameChat.prototype.send_message = function() {
  	author = $('#author', this.tr_new_message).val();
  	message = $('#message', this.tr_new_message).val();
  	socket.emit('chat_message', {author: author, message: message});
  }

  GameChat.prototype.write_message = function(author, message) {
  	var new_message = this.message_template.clone();
  	$('.author', new_message).text(author);
  	$('.message', new_message).text(message);
  	$(new_message).removeClass('hidden');
  	$(new_message).attr('id', 'message_received');
  	$('tbody', this.chat_board).prepend(new_message);
  }

  


  return GameChat;
})();