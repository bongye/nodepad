
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
	, mongoose = require('mongoose')
	, mongoStore = require('connect-mongodb')
	, models = require('./models.js')
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

	routes.documents.initialize(Document);
	routes.sessions.initialize(User);
	routes.users.initialize(User);
});

// Route

app.get('/', routes.index);

app.get('/documents.:format?', routes.sessions.loadUser, routes.documents.index);
app.post('/documents.:format?', routes.documents.create);
app.get('/documents/:id.:format?/edit', routes.documents.edit);
app.get('/documents/new', routes.documents.new);
app.del('/documents/:id.:format?', routes.documents.delete);
app.get('/documents/:id.:format?', routes.documents.show);
app.put('/documents/:id.:format?', routes.documents.update);

app.get('/sessions/new', routes.sessions.new);
app.post('/sessions', routes.sessions.create);
app.del('/sessions', routes.sessions.loadUser, routes.sessions.delete);

app.get('/users/new', routes.users.new);
app.post('/users.:format?', routes.users.create);

if(!module.parent){
	app.listen(3000);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
