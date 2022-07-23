const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authToken = (req, res, next) => {
	const token = req.cookies.twitterertoken;
	
	if(!token) {
		req.noauth = true;
	}
	else {
		jwt.verify(token, process.env.JWT_SECRET_KEY, function(error, user) {
			if(error) {
				req.noauth = true;
			}
			else {
				req.username = user.username;
			}
		});
	}

	next();
};