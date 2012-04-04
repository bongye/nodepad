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
		user_id: ObjectId,
		keywords: [String]
	});

	Document.virtual('id').get(function(){
		return this._id.toHexString();
	});

	Document.pre('save', function(next){
		this.keywords = extractKeywords(this.data);
		next();
	});

	function extractKeywords(text){
		if(!text) return [];

		return text.
			split('/\s+/').
			filter(function(v){ return v.length > 2; }).
			filter(function(v, i, a){ return a.lastIndexOf(v) === i; });
	}

	mongoose.model('Document', Document);
};
