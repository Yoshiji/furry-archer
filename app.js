
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , fs = require('fs')
  , path = require('path');

// Loads the /config/config.js
exports = module.exports = config = require('./config/config');


// Loads the models in /app/models/*.js
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file);
})

// Loads Express with the /config/config.js and deployes routes with /config/routes.js
var app = express();
require('./config/express.js')(app, config);
require('./config/routes.js')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
