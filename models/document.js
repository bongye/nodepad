module.exports = function(app){
	var mongoose = app.mongoose;
	var Schema = mongoose.Schema;

	var Document = new Schema({
		title: {
			type: String, 
			index:true
		},
		data: String,
		tags: [String]
	});

	Document.virtual('id').get(function(){
		return this._id.toHexString();
	});

	mongoose.model('Document', Document);
};
