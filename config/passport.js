//Initilise and Require all of the components required from the passport framework for authentication.
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

//Load the user model that we specified for the database
var User = require('../app/models/user');

//Load in the authrisation variables required for Facebook, Twitter and Google
var configAuth = require('./auth');

module.exports = function (passport) {

	//------Passport-Sessions--------
	//Serialise and Deserialise are used to keep the users session

	//Serialises the user in the session. done(null, user.id) returns the user that
	//authenticated. done(null, false) would indicate a failure to passport
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	//Deserialises the user, returns done(null, user) if found indicating a user was found
	//else returns the error with it.
	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	//------Passport-Stratergy-------
	//All of the stratergies after local are the same so just look at the comments I wrote above Luke.

	//Instead of username overide and require an email
	//Pass req to route so the route can check if the user is logged in.
	passport.use('local-login', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},

		function (req, email, password, done) {
			//Turn the email lowercase
			if (email)
				email = email.toLowerCase();

			process.nextTick(function () {
				User.findOne({
					'local.email': email
				}, function (err, user) {
					//Error-Prevention
					if (err)
						return done(err);

					//No user found - Return a message done(null, false, message) indicates a failure to passport
					if (!user)
						return done(null, false, req.flash('loginMessage', 'No user found.'));

					if (!user.validPassword(password))
						return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

					//If all critera above false && valid password return the user
					else
						return done(null, user);
				});
			});

		}));

	//Instead of username overide and require an email
	//Pass req to route so the route can check if the user is logged in.
	passport.use('local-signup', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function (req, email, password, done) {

			if (email)
				email = email.toLowerCase();

			//Validation
			if (unvalidator(req.body.full_name))
				return done(null, false, req.flash('signupMessage', 'All fields are required (Full Name)'));
			if (unvalidator(password))
				return done(null, false, req.flash('signupMessage', 'All fields are required (Password)'));


			process.nextTick(function () {
				//Check if the user is still logged in
				if (!req.user) {
					User.findOne({
						'local.email': email
					}, function (err, user) {
						if (err)
							return done(err);

						//Check if there is a user with the email
						if (user) {
							return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
						} else {
							//Create the user with the values and save to database.
							var newUser = new User();

							newUser.local.email = email;
							newUser.local.password = newUser.generateHash(password);
							newUser.local.full_name = req.body.full_name;

							newUser.save(function (err) {
								if (err)
									return done(err);
								return done(null, newUser);
							});
						}

					});
					//Check if the user is signed in (through FB TW or G) but doesnt have a local account
				} else if (!req.user.local.email) {
					//Disallow if the account they are trying to connect already exists locally.
					User.findOne({
						'local.email': email
					}, function (err, user) {
						if (err)
							return done(err);

						if (user) {
							return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
						} else {
							var user = req.user;
							user.local.email = email;
							user.local.password = user.generateHash(password);
							user.local.full_name = req.body.full_name;

							user.save(function (err) {
								if (err)
									return done(err);
								return done(null, user);
							});
						}
					});
				} else {
					//User is already logged in and has a local account, Ignore attemt return curent user.
					return done(null, req.user);
				}

			});

		}));

	passport.use(new FacebookStrategy({

			clientID: configAuth.facebookAuth.clientID,
			clientSecret: configAuth.facebookAuth.clientSecret,
			callbackURL: configAuth.facebookAuth.callbackURL,
			profileFields: ['id', 'name', 'email'],
			passReqToCallback: true

		},
		function (req, token, refreshToken, profile, done) {

			process.nextTick(function () {

				//If no user is logged into the session
				if (!req.user) {
					return done(null, false, req.flash('connectMessage', 'You are not logged in.'));
				} else if (req.user) {
					var user = req.user;

					//Search for a matching account with the facebook ID and check it relates to the account currently signed in
					User.findOne({
						'facebook.id': profile.id
					}, function (err, userFound) {
						if (err)
							return done(err);

						//If there is a user with that facebook ID
						if (userFound) {
							//If user already connected to this account refresh the info (should never be called)
							if (userFound._id == user._id) {
								user.facebook.id = profile.id;
								user.facebook.token = token;
								user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
								user.facebook.email = (profile.emails[0].value || '').toLowerCase();

								user.save(function (err) {
									if (err)
										return done(err);

									return done(null, false, req.flash('connectMessage', 'This Facebook account is connected.'));
								});
							} else {
								return done(null, false, req.flash('connectMessage', 'This Facebook account is already linked to an account.'));
							}
						} else {
							//If no user has that ID then add to this account
							user.facebook.id = profile.id;
							user.facebook.token = token;
							user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
							user.facebook.email = (profile.emails[0].value || '').toLowerCase();

							user.save(function (err) {
								if (err)
									return done(err);

								return done(null, user);
							});
						}

					});
					//Should never be called
				} else {
					return done(null, false, req.flash('connectMessage', 'Something went wrong.'));
				}
			});

		}));

	passport.use(new TwitterStrategy({

			consumerKey: configAuth.twitterAuth.consumerKey,
			consumerSecret: configAuth.twitterAuth.consumerSecret,
			callbackURL: configAuth.twitterAuth.callbackURL,
			passReqToCallback: true

		},
		function (req, token, tokenSecret, profile, done) {

			process.nextTick(function () {

				//If no user is logged into the session
				if (!req.user) {
					return done(null, false, req.flash('connectMessage', 'You are not logged in.'));
				} else if (req.user) {
					var user = req.user;

					//Search for a matching account with the Twitter ID and check it relates to the account currently signed in
					User.findOne({
						'twitter.id': profile.id
					}, function (err, userFound) {
						if (err)
							return done(err);

						//If there is a user with that Twitter ID
						if (userFound) {
							//If user already connected to this account refresh the info (should never be called)
							if (userFound._id == user._id) {
								user.twitter.id = profile.id;
								user.twitter.token = token;
								user.twitter.username = profile.username;
								user.twitter.displayName = profile.displayName;

								user.save(function (err) {
									if (err)
										return done(err);

									return done(null, false, req.flash('connectMessage', 'This Twitter account is connected.'));
								});
							} else {
								return done(null, false, req.flash('connectMessage', 'This Twitter account is already linked to an account.'));
							}
						} else {
							//If no user has that ID then add to this account
							user.twitter.id = profile.id;
							user.twitter.token = token;
							user.twitter.username = profile.username;
							user.twitter.displayName = profile.displayName;

							user.save(function (err) {
								if (err)
									return done(err);

								return done(null, user);
							});
						}

					});
					//Should never be called
				} else {
					return done(null, false, req.flash('connectMessage', 'Something went wrong.'));
				}

			});

		}));

	passport.use(new GoogleStrategy({

			clientID: configAuth.googleAuth.clientID,
			clientSecret: configAuth.googleAuth.clientSecret,
			callbackURL: configAuth.googleAuth.callbackURL,
			passReqToCallback: true

		},
		function (req, token, refreshToken, profile, done) {

			process.nextTick(function () {

				//If no user is logged into the session
				if (!req.user) {
					return done(null, false, req.flash('connectMessage', 'You are not logged in.'));
				} else if (req.user) {
					var user = req.user;

					//Search for a matching account with the Google ID and check it relates to the account currently signed in
					User.findOne({
						'google.id': profile.id
					}, function (err, userFound) {
						if (err)
							return done(err);

						//If there is a user with that Google ID
						if (userFound) {
							//If user already connected to this account refresh the info (should never be called)
							if (userFound._id == user._id) {
								user.google.id = profile.id;
								user.google.token = token;
								user.google.name = profile.displayName;
								user.google.email = (profile.emails[0].value || '').toLowerCase();

								user.save(function (err) {
									if (err)
										return done(err);

									return done(null, false, req.flash('connectMessage', 'This Google account is connected.'));
								});
							} else {
								return done(null, false, req.flash('connectMessage', 'This Google account is already linked to an account.'));
							}
						} else {
							//If no user has that ID then add to this account
							user.google.id = profile.id;
							user.google.token = token;
							user.google.name = profile.displayName;
							user.google.email = (profile.emails[0].value || '').toLowerCase();

							user.save(function (err) {
								if (err)
									return done(err);

								return done(null, user);
							});
						}

					});
					//Should never be called
				} else {
					return done(null, false, req.flash('connectMessage', 'Something went wrong.'));
				}

			});

		}));

};

//Validate values
function unvalidator(item) {
	return (!item || item.length < 1 || item == '' || typeof item == 'undefined');
}