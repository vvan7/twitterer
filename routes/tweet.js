var express = require('express');
var router = express.Router();
const authJwt = require('./authJwt');
const Tweet = require('../models/tweet');
const User = require('../models/user');

router.get('/:id', authJwt.authToken, (req, res) => {
	if(req.noauth === true) return res.redirect('/login');
	Tweet.findOne({ _id: req.tweetid }).lean().exec(function(error, twt) {
		if(error || !twt) return res.redirect('/login');

		Tweet.findOne({ _id: twt.replyto }).lean().exec(function(error, sometwt) {
			if(error) return res.redirect('/login');

			User.findOne({ username: req.username, liked: { $in: twt } }).lean().exec(function(error, user1) {
				if(error) return res.redirect('/login');
				
				if(!sometwt) {
					if(!user1) {
						res.render('tweet', { username: req.username, tweetid: req.tweetid, tweet: twt, sometweet: '', liked: 'n' });
					}
					else {
						res.render('tweet', { username: req.username, tweetid: req.tweetid, tweet: twt, sometweet: '', liked: 'y' });
					}
				}
				else {
					if(!user1) {
						res.render('tweet', { username: req.username, tweetid: req.tweetid, tweet: twt, sometweet: sometwt, liked: 'n' });
					}
					else {
						res.render('tweet', { username: req.username, tweetid: req.tweetid, tweet: twt, sometweet: sometwt, liked: 'y' });
					}
				}
			});
		});
	});
});

router.post('/:id/reply', authJwt.authToken, async (req, res) => {
	const { tweettext } = req.body;
	
	if(!tweettext || typeof tweettext !== 'string') {
		return res.json({ status: 'error', error: 'Invalid Tweeeet Reply' });
	}
	if(tweettext.length < 1 || tweettext.length > 100) {
		return res.json({ status: 'error', error: 'Tweeeet < 100 Characters Please' });
	}

	Tweet.create({
		author: req.username,
		text: tweettext,
		date: new Date(),
		replyto: req.tweetid
	},
	function(error, twt) {
		if(error) return res.json({ status: 'error', error: 'Error creating reply' });

		Tweet.updateOne({ _id: req.tweetid }, { $inc: { replies: 1 } }, function(error, result) {
			if(error) return res.json({ status: 'error', error: 'Error replies update' });
	
			res.json({ status: 'ok'});
		});
	});
});

router.post('/:id/replies', authJwt.authToken, async (req, res) => {
	const { lasttime } = req.body;
	
	Tweet.find({ date: { $lt: lasttime }, replyto: req.tweetid }).sort({ date: -1 }).limit(10).lean().exec(function(error, twt) {
		if(error) return res.json({ status: 'error', error: 'Error fetching replies' });

		res.json({ status: 'ok', tweets: twt });
	});
});

router.post('/:id/like', authJwt.authToken, async (req, res) => {
	Tweet.findOne({ _id: req.tweetid }).lean().exec(function(error, tweet) {
		if(error) return res.json({ status: 'error', error: 'Error get tweeeet' });

		User.findOne({ username: req.username, liked: { $in: tweet._id } }).lean().exec(function(error, user1) {
			if(error) return res.json({ status: 'error', error: 'Error like unfollow' });

			if(!user1) {
				User.updateOne({ username: req.username }, { $push: { liked: tweet._id } }, function(error, result) {
					if(error) return res.json({ status: 'error', error: 'Error liked' });
					
					Tweet.updateOne({ _id: req.tweetid }, { $inc: { likes: 1 } }, function(error, result) {
						if(error) return res.json({ status: 'error', error: 'Error likes update' });

						Tweet.findOne({ _id: req.tweetid }).lean().exec(function(error, twt) {
							if(error) return res.json({ status: 'error', error: 'Error get likes update' });

							res.json({ status: 'ok', tweet: twt });
						});
					});
				});
			}
			else {
				User.updateOne({ username: req.username }, { $pull: { liked: tweet._id } }, function(error, result) {
					if(error) return res.json({ status: 'error', error: 'Error unlike' });

					Tweet.updateOne({ _id: req.tweetid }, { $inc: { likes: -1 } }, function(error, result) {
						if(error) return res.json({ status: 'error', error: 'Error likes update' });
						
						Tweet.findOne({ _id: req.tweetid }).lean().exec(function(error, twt) {
							if(error) return res.json({ status: 'error', error: 'Error get likes update' });

							res.json({ status: 'ok', tweet: twt });
						});
					});
				});
			}
		});
	});
});

router.param('id', (req, res, next, id) => {
    req.tweetid = id;
	next();
});

module.exports = router;