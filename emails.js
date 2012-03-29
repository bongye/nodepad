var path = require('path')
  , util = require('util')
	, jade = require('jade')
	, mailer = require('mailer');

module.exports = function(app){
	emails = {
		send: function(template, mailOptions, templateOptions){
			jade.renderFile(path.join(__dirname, 'views', 'mailer', template), templateOptions, function(err, text){
				mailOptions.body = text;

				var keys = Object.keys(app.set('mailOptions'));
				for(var i=0, len = keys.length; i < len; i++){
					var k = keys[i];
					if(!mailOptions.hasOwnProperty(k)){
						mailOptions[k] = app.set('mailOptions')[k];
					}
				}

				console.log('[SENDING MAIL]', util.inspect(mailOptions));

				if (app.settings.env == 'production'){
					mailer.send(mailOptions, function(err, result){
						if(err){
							console.log(err);
						}
					});
				}
			});
		},

		sendWelcome: function(user){
			this.send('welcome.jade', {
				to: user.email,
				subject: 'Welcome to Nodepad'
			}, {
				user: user
			});
		}
	};

	return emails;
};
