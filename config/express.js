// Express configuration file

var express = require('express')
  , mongoStore = require('connect-mongo')(express)
  , flash = require('connect-flash')
  , path = require('path')
  , lessMiddleware = require('less-middleware')
  , authorization = require('./middlewares/authorization.js');

module.exports = function (app, config) {
    app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', config.root_path + '/app/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(flash());

    //MODE DEVELOPMENT
    app.use(lessMiddleware({ 
      src: config.root_path + '/public',
      debug: true,
      once: true,
      force: true
      }));
    app.get('*', authorization('on'));
    app.use(express.static(config.root_path + '/public'));

    app.use(app.router);

    console.log(config.root_path + '/public/stylesheets');
  });
  
  app.configure('development', function(){
    app.use(express.errorHandler());
  });
}
