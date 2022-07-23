var express = require('express');
var router = express.Router();
const authJwt = require('./authJwt');
const Tweet = require('../models/tweet');
const User = require('../models/user');


router.get('/:id', authJwt.authToken, (req, res) => {
	if(req.noauth === true) return res.redirect('/login');
	User.findOne({ username: req.userid }).lean().exec(function(error, user2) {
		if(error || !user2) return res.redirect('/login');

		if(req.username === req.userid) {
			Tweet.find({ _id: user2.liked }).lean().exec(function(error, liked) {
				if(error) return res.redirect('/login');

				User.find( { _id: user2.follows }, 'username' ).lean().exec(function(error, follows) {
					if(error) return res.redirect('/login');

					res.render('user', { username: req.username, userid: req.userid , liked: liked, following: 'n', follows: follows});
				});
			});
		}
		else {
			User.findOne({ username: req.username, follows: { $in: user2 } }).lean().exec(function(error, user1) {
				if(error) return res.redirect('/login');

				if(!user1) {
					res.render('user', { username: req.username, userid: req.userid , following: 'n', follows: [], liked: [] });
				}
				else {
					res.render('user', { username: req.username, userid: req.userid , following: 'y', follows: [], liked: [] });
				}
			});
		}
	});
});

router.post('/:id/create', authJwt.authToken, async (req, res) => {
	const { tweettext } = req.body;
	
	if(!tweettext || typeof tweettext !== 'string') {
		return res.json({ status: 'error', error: 'Invalid tweeeet' });
	}
	if(tweettext.length < 1 || tweettext.length > 100) {
		return res.json({ status: 'error', error: 'Tweeeet 1-100 characters please' });
	}

	if(req.username === req.userid) {
		Tweet.create({
			author: req.username,
			text: tweettext,
			date: new Date()
		},
		function(error, twt) {
			if(error) return res.json({ status: 'error', error: 'Error creating tweeeet' });

			res.json({ status: 'ok'});
		});
	}
	else {
		res.json({ status: 'error', error: 'Invalid user' });
	}
});

router.post('/:id/tweets', authJwt.authToken, async (req, res) => {
	const { lasttime } = req.body;
	
	const user2 = await User.findOne({ username: req.userid }).lean();
	if(!user2) {
		return res.json({ status: 'error', error: 'Invalid user' });
	}

	let following = [];
	
	if(req.username === req.userid) {
		const fllw = await User.find({ _id: user2.follows }, 'username').lean();
		for(f of fllw) following.push(f.username);
	}

	following.push(req.userid);

	Tweet.find({ author: { $in: following }, date: { $lt: lasttime }, replyto: null }).limit(10).lean().exec(function(error, twt) {
		if(error) return res.json({ status: 'error', error: 'Error fetching tweeeet' });

		res.json({ status: 'ok', tweets: twt });
	});
});

router.post('/:id/follow', authJwt.authToken, async (req, res) => {
	if(req.username === req.userid) {
		res.json({ status: 'error', error: 'Invalid follow' });
	}

	User.findOne({ username: req.userid }).lean().exec(function(error, user2) {
		if(error) return res.json({ status: 'error', error: 'Error follow unfollow' });

		User.findOne({ username: req.username, follows: { $in: user2 } }).lean().exec(function(error, user1) {
			if(error) return res.json({ status: 'error', error: 'Error follow unfollow' });

			if(!user1) {
				User.updateOne({
					username: req.username
				}, {
					$push: { follows: user2._id }
				},
				function(error, result) {
					if(error) return res.json({ status: 'error', error: 'Error follow' });
			
					res.json({ status: 'ok'});
				});
			}
			else {
				User.updateOne({
					username: req.username
				}, {
					$pull: { follows: user2._id }
				},
				function(error, result) {
					if(error) return res.json({ status: 'error', error: 'Error unfollow' });

					res.json({ status: 'ok'});
				});
			}
		});
	});
});

router.param('id', (req, res, next, id) => {
	req.userid = id;
	next();
});

module.exports = router;