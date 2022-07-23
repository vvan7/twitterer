var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

router.get('/', (req, res) => {
	res.render('signup');
});

router.post('/api', async (req, res) => {
	const { username, password: plainpassword } = req.body;

	if(!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' });
	}
	if(!plainpassword || typeof plainpassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' });
	}
	if(username.length < 4) {
		return res.json({ status: 'error', error: 'Username should be > 3' });
	}
	if(plainpassword.length < 4) {
		return res.json({ status: 'error', error: 'Password should be > 3' });
	}
	if(username.length > 30) {
		return res.json({ status: 'error', error: 'Username should be < 31' });
	}
	if(plainpassword.length > 30) {
		return res.json({ status: 'error', error: 'Password should be < 31' });
	}
	
	bcrypt.genSalt(10, function(error, salt) {
		if(error) return res.json({ status: 'error', error: 'Salt error' });

		bcrypt.hash(plainpassword, salt, function(error, hash) {
			if(error) return res.json({ status: 'error', error: 'Hash error' });

			password = hash;

			User.create({
				username, 
				password
			},
			function(error, user) {
				if(error) return res.json({ status: 'error', error: 'Username already in use' });
				res.json({ status: 'ok' });
			});
		});
	});
});

module.exports = router;