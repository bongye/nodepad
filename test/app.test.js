var app = require('../app')
  , lastID = '';

module.exports = {
	'POST /documents.json': function(beforeExit, assert){
		assert.response(app, {
			url: '/documents.json',
			method: 'POST',
			data: JSON.stringify({ 
				document: {
					title: 'Test' 
				} 
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}, {
			status: 200,
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		}, function(res){
			var document = JSON.parse(res.body);
			assert.eql('Test', document.title);
			lastID = document._id;
		});
	},

	'HTML POST /documents': function(beforeExit, assert){
		assert.response(app, {
			url: '/documents',
			method: 'POST',
			data: 'document[title]=test',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}, {
			status: 302,
			headers: {
				'Content-Type': 'text/html'
			}
		}, function(){
		});
	},

	'GET /documents.json' : function(beforeExit, assert){
		assert.response(app, {
			url: '/documents.json'
		}, {
			status: 200,
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		}, function(res){
			var documents = JSON.parse(res.body);
			assert.type(documents, 'object');
			documents.forEach(function(d){
				app.Document.findById(d._id, function(document){
					if(document) document.remove();
				});
			});
		});
	},

	'GET /': function(beforeExit, assert){
		assert.response(app, {
			url: '/'
		}, {
			status: 200,
			headers: {
				'Content-Type': 'text/html; charset=utf-8'
			}
		}, function(res){
			assert.includes(res.body, '<title>Express</title>');
		});
	}
};
