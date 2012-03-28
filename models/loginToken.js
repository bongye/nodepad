module.exports = function(app){
	var mongoose = app.mongoose;
	var Schema = mongoose.Schema;

	var LoginToken = new Schema({
		email: {
			type: String,
			index: true
		},
		series: {
			type: String,
			index: true
		},
		token: {
			type: String,
			index: true
		}
	});

	LoginToken.method('randomToken', function(){
		return Math.round((new Date().valueOf() * Math.random())) + '';
	});

	LoginToken.pre('save', function(next){
		this.token = this.randomToken();
		if(this.isNew){
			this.series = this.randomToken();
		}
		next();
	});

	LoginToken.virtual('id').get(function(){
		return this._id.toHexString();
	});

	LoginToken.virtual('cookieValue').get(function(){
		return JSON.stringify({
			email: this.email,
			token: this.token,
			series: this.series
		});
	});

	mongoose.model('LoginToken', LoginToken);
};
