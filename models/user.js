var crypto = require('crypto');

module.exports = function(app){
	var mongoose = app.mongoose;

	function validatePresenceOf(value){
		return value && value.length;
	}

	var Schema = mongoose.Schema;

	var User = new Schema({
		email: {
			type: String,
			validate: [validatePresenceOf, 'an email is required'],
			index: {
				unique: true
			}
		},
		hashed_password: String,
		salt: String
	});

	User.virtual('id').get(function(){
		return this._id.toHexString();
	});

	User.virtual('password').set(function(password){
		this._password = password;
		this.salt = this.makeSalt();
		this.hashed_password = this.encryptPassword(password);
	}).get(function(){
		return this._password;
	});

	User.method('authenticate', function(plainText){
		return this.encryptPassword(plainText) == this.hashed_password;
	});

	User.method('makeSalt', function(){
		return Math.round((new Date().valueOf() * Math.random())) + '';
	});

	User.method('encryptPassword', function(password){
		return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	});

	User.pre('save', function(next){
		if(!validatePresenceOf(this.password)){
			next(new Error('Invalid Password'));
		} else {
			next();
		}
	});

	mongoose.model('User', User);
};
