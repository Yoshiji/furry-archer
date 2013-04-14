// list of restricted urls
var restricted = [
'/game',
'/game/'
];

// middleware enabled or not
var enabled = true;

// the middleware function
module.exports = function(onoff) {

  enabled = (onoff == 'on') ? true : false;

  console.log("chat");
  return function(req, res, next) {
    if(req.session.flash){
      res.locals.flash = req.session.flash;
      delete req.session.flash;
    }
    if(req.session.user){
      res.locals.user = req.session.user;
    }
    if(enabled  && !req.session.user && restricted.indexOf(req.url) > -1){
      res.redirect("/game/login");
    }else{
      next();
    }
    
  }
};