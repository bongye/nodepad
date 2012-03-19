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

exports.show = function(req, res){
	// Find the user and set the current User session variable
};

exports.delete = function(req, res){
	if(req.session){
		req.session.destroy(function(){
		});
	}
	res.redirect('/sessions/new');
};
