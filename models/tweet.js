var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TweetSchema = new Schema(
{
	author: {type: String, required: true, maxLength: 30},
	text: {type: String, required: true, maxLength: 100},
	date: {type: Date, required: true},
	replyto: {type: Schema.Types.ObjectId, ref: 'TweetSchema'},
	likes: { type: Number, min: 0, default: 0 },
	replies: { type: Number, min: 0, default: 0 },
}, { 
	collection: 'tweet'
});

module.exports = mongoose.model('TweetSchema', TweetSchema);