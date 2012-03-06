
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
	, mongoose = require('mongoose')
	, models = require('./models.js')
	, db
	, Document;


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

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

models.defineModels(mongoose, function(){
	app.Document = Document = mongoose.model('Document');
	db = mongoose.connect(app.set('db-uri'));

	routes.document.initialize(Document);
});

// Routes

app.get('/', routes.index);

app.get('/documents.:format?', routes.document.list);
app.post('/documents.:format?', routes.document.create);
app.get('/documents/:id.:format?/edit', routes.document.edit);
app.get('/documents/new', routes.document.new);
app.del('/documents/:id.:format?', routes.document.delete);
app.get('/documents/:id.:format?', routes.document.read);
app.put('/documents/:id.:format?', routes.document.update);


if(!module.parent){
	app.listen(3000);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
