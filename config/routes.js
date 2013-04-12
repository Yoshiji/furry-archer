
/*
 * get the controllers required for mapping:
 * url -> controller(action)
*/

var home_controller = require('../app/controllers/home.js')
    , game_controller = require('../app/controllers/game.js');


module.exports = function (app) {

  // Home route
  app.get('/', home_controller.index);
  
  // Game root route
  app.get('/game', game_controller.index);

  // Game login route
  app.get('/game/login', game_controller.login);
  app.post('/game/login', game_controller.login_post);

  // Game signup route
  app.get('/game/signup', game_controller.signup);
  app.post('/game/signup', game_controller.signup_post);


  // Game logout route
  app.get('/game/logout', game_controller.logout);
}