
var home_controller = require('../app/controllers/home.js');

module.exports = function (app) {

  // home route
  app.get('/', home_controller.index);

}