/*
 * This Controller should respond to actions about the Game in general
 *
 *
 *
 *
*/


exports.index = function(req, res, next) {
  res.render('game/index');
}

exports.login = function(req, res, next) {
  res.render('game/login');
}

exports.login_post = function(req, res, next) {
  //req.session.user['id'] = 1

  // est-il loggé ?
  if(req.session.user){
    res.redirect('game');

  // non ?
  }else{
    // mais il veut se logguer avec un bon password ? ok on le loggue ...
    if(req.body.login == "admin" && req.body.password == "admin"){
      req.session.user = {}
      req.session.user.id = 1
      req.session.user.name = "Coquine"
      req.flash('notice', "You're logged Bitch!");
      res.redirect('game');
    }else{
      res.locals.flash = {}
      res.locals.flash['error'] = "Wrong login/password try again ...";
    }
    // veut pas se logguer / wrong password ? redirection ...
    res.render('game/login');
  }

    
}

exports.logout = function(req, res, next) {
  if(req.session.user){
    delete req.session.user
    req.flash('notice', "Go away Bitch!");
  }else{
    req.flash('error', "You were not logged, please login now ...");
  }
  res.redirect('game/login');
}