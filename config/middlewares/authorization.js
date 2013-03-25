// list of restricted urls
var restricted = [
'/game'
];

// middleware enabled or not
var enabled = true;

// the middleware function
module.exports = function(onoff) {

  enabled = (onoff == 'on') ? true : false;

  console.log("chat");
  return function(req, res, next) {
    console.log(req.url);
    console.log(req.session.flash);

    if(req.session.flash){
      res.locals.flash = req.session.flash;
      delete req.session.flash;
    }
    if(req.session.user){
      res.locals.user = req.session.user;
    }
    if(enabled  && !req.session.user && restricted.indexOf(req.url) > -1){
      res.redirect("/game/login");
      console.log("chat redirect");
    }else{
      console.log("chat");
      next();
    }
    
  }
};