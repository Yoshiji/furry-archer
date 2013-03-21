// Express configuration file

var express = require('express')
  , mongoStore = require('connect-mongo')(express)
  , flash = require('connect-flash')
  , path = require('path');
  

module.exports = function (app, config) {
    app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', config.root_path + '/app/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(config.root_path + '/public'));
  });
  
  app.configure('development', function(){
    app.use(express.errorHandler());
  });
}
