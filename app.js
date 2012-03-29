
/**
 * Module dependencies.
 */

var express = require('express')
	, mongoose = require('mongoose')
	, mongoStore = require('connect-mongodb')
	, markdown = require('markdown').markdown
	, util = require('util')
	, db
	, Document
  , User
	, LoginToken;


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
	app.set('mailOptions', {
		host: 'localhost',
		port: '25',
		from: 'nodepad@example.com',
		domain: 'localhost'
	});
});


// Models
app.mongoose = mongoose;
require('./models')(app, function(){
	app.Document = Document = mongoose.model('Document');
	app.User = User = mongoose.model('User');
	app.LoginToken = LoginToken = mongoose.model('LoginToken');
	db = mongoose.connect(app.set('db-uri'));
});

// Mailer
app.emails = require('./emails.js')(app);

// Helper
app.helpers(require('./helpers.js').helpers);
app.dynamicHelpers(require('./helpers.js').dynamicHelpers);

// Error Handling
app.NotFound = NotFound = function(msg){
	this.name = 'NotFound';
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
};

util.inherits(NotFound, Error);


// Library Loading
app.markdown = markdown;

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

function authenticateFromLoginToken(req, res, next){
	var cookie = JSON.parse(req.cookies.logintoken);
	
	LoginToken.findOne({
		email: cookie.email,
		series: cookie.series,
		token: cookie.token
	}, function(err, token){
		if(!token){
			res.redirect('/sessions/new');
			return;
		}

		User.findOne({
			email: token.email
		}, function(err, user){
			if(user){
				req.session.user_id = user.id;
				req.currentUser = user;

				token.token = token.randomToken();
				token.save(function(){
					res.cookie('logintoken', token.cookieValue, {
						expires: new Date(Date.now() + 2 * 604800000),
						path: '/'
					});
					next();
				});
			} else {
				res.redirect('/sessions/new');
			}
		});
	});
}

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
	} else if(req.cookies.logintoken) {
		authenticateFromLoginToken(req, res, next);
	} else {
		res.redirect('/sessions/new');
	}
};

app.get('/', loadUser,  function(req,res){
	res.redirect('/documents');
});

require('./routes')(app);


// Start
if(!module.parent){
	app.listen(3000);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
