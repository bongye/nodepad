var Document;

exports.initialize = function(aDocument){
	Document = aDocument;
};

// Document list
exports.index = function(req, res){
	Document.find({}, function(err, documents){
		switch(req.params.format){
			case 'json':
				res.send(documents.map(function(d){
					return d.toObject();
				}));
			break;
			default:
				res.render('documents/index.jade', {
					locals: {documents: documents}
				});
			break;
		}
	});
};

// Create document
exports.create = function(req, res){
	var d = new Document(req.body['document']);
	d.save(function(){
		switch(req.params.format){
			case 'json':
				res.send(d.toObject());
			break;
			default:
				res.redirect('/documents');
			break;
		}
	});
};

// Show document
exports.show = function(req, res){
	Document.findById(req.params.id, function(err, d){
		switch(req.params.format){
			case 'json':
				res.send(d.toObject());
			break;
			default:
				res.render('documents/show.jade', {
					locals: {
						d: d
					}
				});
		}
	});
};

// Update document
exports.update = function(req, res){
	Document.findById(req.params.id, function(err, d){
		d.title = req.body.document.title;
		d.data = req.body.document.data;

		d.save(function(){
			switch(req.params.format){
				case 'json':
					res.send(d.toObject());
				break;
				default:
					res.redirect('/documents');
			}
		});
	});
};

// Delete document
exports.delete = function(req, res){
	Document.findById(req.params.id, function(err, d){
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
};

// Edit document
exports.edit = function(req, res){
	Document.findById(req.params.id, function(err, d){
		res.render('documents/edit.jade', {
			locals: {
				d: d
			}
		});
	});
};

// New Document
exports.new = function(req, res){
	res.render('documents/new.jade', {
		locals: {
			d: new Document()
		}
	});
};
