
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose');

// Loads the /config/config.js
exports = module.exports = config = require('./config/config');

// Establish connection with the DB following the credentials in config/config.js[development][db]
mongoose.connect(config.development.db);

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
