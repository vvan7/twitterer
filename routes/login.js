var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.get('/', (req, res) => {
	res.cookie('twitterertoken', 'token').render('login');
});

router.post('/api', async (req, res) => {
    const { username, password } = req.body;
	
    const user = await User.findOne({ username: username }).lean();
    if(!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' });
	}
	
	bcrypt.compare(password, user.password, function(error, result) {
		if(error) return res.json({ status: 'error', error: 'Invalid username/password' });

		if(result === true) {
			jwt.sign({ username: user.username }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }, function(error, token) {
				if(error) return res.json({ status: 'error', error: 'jwt sign error' });
				res.cookie('twitterertoken', token, { sameSite: true }).json({ status: 'ok', data: token });
			});
		}
		else {
			res.json({ status: 'error', error: 'Invalid username/password' });
		}
	});
});

module.exports = router;