
/**
 * Module dependencies.
 */

var express = require('express')
	, mongoose = require('mongoose')
	, mongoStore = require('connect-mongodb')
	, models = require('./models.js')
	, util = require('util')
	, db
	, Document
  , User;


var app = module.exports = express.createServer();

// Configuration

app.configure('test', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.set('db-uri', 'mongodb://localhost/nodepad-test');
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.set('db-uri', 'mongodb://localhost/nodepad-development');
});

app.configure('production', function(){
  app.use(express.errorHandler());
	app.set('db-uri', 'mongodb://localhost/nodepad-production');
});

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ 
		store: mongoStore(app.set('db-uri')),
		secret: 'topsecret' 
	}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

models.defineModels(mongoose, function(){
	app.Document = Document = mongoose.model('Document');
	app.User = User = mongoose.model('User');
	db = mongoose.connect(app.set('db-uri'));
});

// Error Handling
app.NotFound = NotFound = function(msg){
	this.name = 'NotFound';
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
};

util.inherits(NotFound, Error);

app.get('/404', function(req, res){
	throw new NotFound;
});

app.get('/500', function(req, res){
	throw new Error('An expected error');
});

app.error(function(err, req, res, next){
	if(err instanceof NotFound){
		res.render('404.jade', {
			status:404
		});
	} else {
		next(err);
	}
});

// Route
app.loadUser = loadUser  = function(req, res, next){
	if(req.session.user_id){
		User.findById(req.session.user_id, function(err, user){
			if(user){
				req.currentUser = user;
				next();
			} else {
				res.redirect('/sessions/new');
			}
		});
	} else {
		res.redirect('/sessions/new');
	}
};

app.get('/', loadUser,  function(req,res){
	res.redirect('/documents');
});

require('./routes')(app);

if(!module.parent){
	app.listen(3000);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
