var Document;

exports.defineModels = function(mongoose, callback){
	var Schema = mongoose.Schema;

	Document = new Schema({
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

	callback();
};
