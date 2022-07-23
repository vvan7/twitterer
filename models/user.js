var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
{
	username: {type: String, required: true, unique: true, maxLength: 30},
	password: {type: String, required: true, maxLength: 100},
	liked: [{type: Schema.Types.ObjectId, ref: 'TweetSchema'}],
	follows: [{type: Schema.Types.ObjectId, ref: 'UserSchema'}]
}, { 
	collection: 'user' 
});

module.exports = mongoose.model('UserSchema', UserSchema);