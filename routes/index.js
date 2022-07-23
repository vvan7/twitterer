var express = require('express');
var router = express.Router();
const authJwt = require('./authJwt');
const Tweet = require('../models/tweet');

router.get('/', authJwt.authToken, (req, res) => {
	if(req.noauth === true) return res.redirect('/login');
	
	res.render('index', { username: req.username });
});

router.post('/', authJwt.authToken, async (req, res) => {
	const { lasttime } = req.body;
	Tweet.find({ date: { $lt: lasttime }, replyto: null }).sort({ date: -1 }).limit(10).lean().exec(function(error, twt) {
		if(error) return res.json({ status: 'error', error: 'Error fetching tweeeet' });

		res.json({ status: 'ok', tweets: twt });
	});
});

//get tweets with likes data

module.exports = router;
