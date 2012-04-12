module.exports = function(app){
	var Document = app.Document;
	var NotFound = app.NotFound;
	var markdown = app.markdown;

	// Document list
	app.get('/documents.:format?', app.loadUser, function(req, res){
		Document.find({
				user_id: req.currentUser.id
		}, [], {
				sort: ['title', 'descending']
		}, function(err, documents){
			switch(req.params.format){
				case 'json':
					res.send(documents.map(function(d){
						return d.toObject();
					}));
				break;
				default:
					documents = documents.map(function(d){
						return {
							title: d.title,
							id: d._id
						};
					});
					res.render('documents/index.jade', {
						locals: {
							documents: documents,
							currentUser: req.currentUser
						}
					});
				break;
			}
		});
	});

	app.get('/documents/titles.json', app.loadUser, function(req, res){
		Document.find({
			user_id: req.currentUser.id
		}, [], {
			sort: ['title', 'descending']
		}, function(err, documents){
			res.send(documents.map(function(d){
				return {
					title: d.title, 
					id: d._id
				};
			}));
		});
	});

	app.post('/search.:format?', app.loadUser, function(req, res){
		Document.find({
			user_id: req.currentUser.id,
			keywords: req.body.s ? req.body.s : null
		}, [], {
			sort: ['title', 'descending']
		}, function(err, documents){
			switch(req.params.format){
				case 'json':
					res.send(documents.map(function(d){
						return {
							title: d.title,
							id: d._id
						}
					}));
				break;
				default:
					res.send('Format not available', 406);
				break;
			}
		});
	});

	// Edit document
	app.get('/documents/:id.:format?/edit', app.loadUser, function(req, res){
		Document.findOne({
			_id: req.params.id,
			user_id: req.currentUser.id
		}, function(err, d){
			res.render('documents/edit.jade', {
				locals: {
					d: d,
					currentUser: req.currentUser
				}
			});
		});
	});

	// New Document
	app.get('/documents/new', app.loadUser, function(req, res){
		res.render('documents/new.jade', {
			locals: {
				d: new Document(),
				currentUser: req.currentUser
			}
		});
	});

	// Create document
	app.post('/documents.:format?', app.loadUser, function(req, res){
		var d = new Document(req.body);
		d.user_id = req.currentUser.id;
		d.save(function(){
			switch(req.params.format){
				case 'json':
					var data = d.toObject();
					data.id = data._id;
					res.send(data);
				break;
				default:
					req.flash('info', 'Document created');
					res.redirect('/documents');
				break;
			}
		});
	});


	// Show document
	app.get('/documents/:id.:format?', app.loadUser, function(req, res, next){
		Document.findOne({
			_id: req.params.id,
			user_id: req.currentUser.id
		}, function(err, d){
			if(!d){
				return next(new NotFound('Document not Found'));
			}

			switch(req.params.format){
				case 'json':
					res.send(d.toObject());
				break;
				case 'html':
					res.send(markdown.toHTML(d.data));
				break;
				default:
					res.render('documents/show.jade', {
						locals: {
							d: d,
							currentUser: req.currentUser
						}
					});
			}
		});
	});

	// Update document
	app.put('/documents/:id.:format?', app.loadUser, function(req, res, next){
		Document.findOne({
			_id: req.params.id,
			user_id: req.currentUser.id
		}, function(err, d){
			if(!d) return next(new NotFound('Document not found'));
			d.title = req.body.title;
			d.data = req.body.data;

			d.save(function(){
				switch(req.params.format){
					case 'json':
						res.send(d.toObject());
					break;
					default:
						req.flash('info', 'Document updated');
						res.redirect('/documents');
				}
			});
		});
	});

	// Delete document
	app.del('/documents/:id.:format?', app.loadUser, function(req, res, next){
		Document.findOne({
			_id: req.params.id,
			user_id: req.currentUser.id
		}, function(err, d){
			if(!d) return next(new NotFound('Document not found'));
			d.remove(function(){
				switch(req.params.format){
					case 'json':
						res.send('true');
					break;
					default:
						res.redirect('/documents');
				}
			});
		});
	});

};
