module.exports = function(app){
	var mongoose = app.mongoose;
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var Document = new Schema({
		title: {
			type: String, 
			index:true
		},
		data: String,
		tags: [String],
		user_id: ObjectId
	});

	Document.virtual('id').get(function(){
		return this._id.toHexString();
	});

	mongoose.model('Document', Document);
};
