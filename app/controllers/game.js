/*
 * This Controller should respond to actions about the Game in general
*/

var mongoose = require('mongoose')
  , bcrypt = require('bcrypt');


exports.index = function(req, res, next) {
  res.render('game/index');
}

exports.login = function(req, res, next) {
  res.render('game/login');
}

exports.login_post = function(req, res, next) {
  //req.session.user['id'] = 1

  if(req.session.user){
    res.redirect('game');
    
  } else {
    User = mongoose.model('User');
    // mais il veut se logguer avec un bon password ? ok on le loggue ...
    User.findOne({username: req.param('username').trim().toLowerCase()}, function (err, user) {
      if(err){
        console.log(err);
      }
      if(user && bcrypt.compareSync(req.param('password'), user.password)){
        req.session.user = {};
        req.session.user = user;
        req.flash('notice', "You're logged Bitch!");
        res.redirect('game');
      }else{
        res.locals.flash = {}
        res.locals.flash['error'] = "Wrong login/password try again ...";
        res.render('game/login');
      }
    });
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



exports.signup = function(req, res, next) {
  res.render('game/signup');
}

exports.signup_post = function(req, res, next) {
  res.locals.flash = {}
  User = mongoose.model('User');

  User.find({username: req.param('username').trim().toLowerCase()}, function (err, users) {
    if (users.length > 0){
      res.locals.flash['error username_exists'] = "Username Already exists.";
      render();
    }else{
      User.find({email: req.param('email').trim().toLowerCase()}, function (err, users) {
        if (users.length > 0){
          res.locals.flash['error email_exists'] = "Email Already exists.";
          render();
        }else{
          if (req.param('password') != req.param('retyped_password')){
            res.locals.flash['error password_not_matching'] = "Passwords do not match!";
            render();
          }else{
            User.create({ 
              username: req.param('username').trim().toLowerCase(),
              email: req.param('email').trim().toLowerCase(),
              password: bcrypt.hashSync(req.param('password'), 8),
              gold: 0,
              level: 0,
              captured_tiles: 0
              
            }, function (err, user) {
              if (err){
                Object.keys(err.errors).forEach(function(key){
                  res.locals.flash['error ' + key] = err.errors[key].type;
                });
                render();
              }else{
                req.flash('notice', "Signup Successful! Please login now.");
                res.redirect('game/login');
              }
            })
          }
        }
      });
    }
  });


  function render(){
    res.render('game/signup');
  }
  
   
}