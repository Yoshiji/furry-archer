module.exports = function (app, config, mongoose, express) {

  // Express configuration file
  var flash = require('connect-flash')
    , path = require('path')
    , lessMiddleware = require('less-middleware')
    , authorization = require('./middlewares/authorization.js');



  // Database
  mongoose.connect('mongodb://localhost/furry_archer');

  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));


    app.configure(function(){

    app.set('port', process.env.PORT || 3000);
    app.set('views', config.root_path + '/app/views');
    app.set('view engine', 'jade');
    app.set('mongoose', mongoose);
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
      debug: false,
      once: true,
      force: true
      }));
    app.get('*', authorization('on'));
    app.use(express.static(config.root_path + '/public'));

    app.use(app.router);
  });
  
  app.configure('development', function(){
    app.use(express.errorHandler());
  });


}
