var User;

exports.initialize = function(aUser){
	User = aUser;
};

exports.loadUser = function(req, res, next){
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

exports.new = function(req, res){
	res.render('sessions/new.jade', {
		locals: {
			user: new User()
		}
	});
};

exports.create = function(req, res){
	User.findOne({ 
		email: req.body.user.email
	}, function(err, user){
		if(user && user.authenticate(req.body.user.password)){
			req.session.user_id = user.id;
			res.redirect('/documents');
		} else {
			// Show Error
			res.redirect('/sessions/new');
		}
	});
};

exports.delete = function(req, res){
	if(req.session){
		req.session.destroy(function(){
		});
	}
	res.redirect('/sessions/new');
};
