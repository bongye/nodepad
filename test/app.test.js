var app = require('../app'),
    assert = require('assert'),
    zombie = require('zombie'),
		testHelper = require('./helper')

describe('Sign in', function(){
	before(function(done){
		app.listen(3000);

		testHelper.clear([app.User], function(){
			var user = new app.User({
				email: 'alex@example.com',
				password: 'test'
			});
			user.save(done);
			console.log('done');
		});
	});

	after(function(done){
		app.close();
		done();
	});

	it('should allow valid users to sign in', function(done){
		var browser = new zombie();
		browser.visit('http://localhost:3000/sessions/new', function(){
			console.log('got page');
			browser.
				fill('user[email]', 'alex@example.com').
				fill('user[password]', 'test').
				pressButton('Log In', function(){
					assert.equal(browser.text('#header a.logout'), 'Log out');
				});
		});
		done();
	});
});
