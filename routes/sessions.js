module.exports = function(app){
	var User = app.User;

	app.get('/sessions/new', function(req, res){
		res.render('sessions/new.jade', {
			locals: {
				user: new User()
			}
		});
	});

	app.post('/sessions', function(req, res){
		User.findOne({ 
			email: req.body.user.email
		}, function(err, user){
			if(user && user.authenticate(req.body.user.password)){
				req.session.user_id = user.id;
				res.redirect('/documents');
			} else {
				// Show Error
				req.flash('error', 'Incorrect credentials');
				res.redirect('/sessions/new');
			}
		});
	});

	app.del('/sessions', function(req, res){
		if(req.session){
			req.session.destroy(function(){
			});
		}
		res.redirect('/sessions/new');
	});
};
