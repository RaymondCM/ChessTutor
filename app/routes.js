module.exports = function (app, passport) {

	//----------Default-Routes-------------
	//Always define child URLS before parent ex. (/contact/us before /contact)

	//With every render pass an object to be interpretted by handlebars that will
	//allow different stylings dependant on whether the user is logged in.
	app.get('/', function (req, res) {
		res.render('play.handlebars', {
			isLoggedIn: req.isAuthenticated()
		});
	});

	app.get('/about', function (req, res) {
		res.render('about', {
			isLoggedIn: req.isAuthenticated()
		});
	});

	app.get('/contact', function (req, res) {
		res.render('contact', {
			isLoggedIn: req.isAuthenticated()
		});
	});

	//This is the page the user will be sent to after a form is processed.
	app.get('/thankyou', function (req, res) {
		res.render('thankyou', {
			isLoggedIn: req.isAuthenticated()
		});
	});

	app.get('/play', function (req, res) {
		res.render('play', {
			isLoggedIn: req.isAuthenticated()
		});
	});

	//For now get the form data using request.body.id and log it to the console
	//In future add directly to the database/email to the chess-tutor email
	//Uses redirect which instead of rendering a page redirects to the route /thankyou
	//Which is above so no loops occur in routing
	app.post('/process', function (req, res) {
		console.log('Form : ' + req.query.form);
		console.log('Email : ' + req.body.email);
		console.log('Question : ' + req.body.ques);
		res.redirect(303, '/thankyou');
	});

	//Profile will not be accesable unless the user is logged in, this is managed by the
	//function isLoggedIn defined at the base of this document, if false the route will
	//redirect to home if true next is called and the body is executed (see function)
	app.get('/profile', isLoggedIn, function (req, res) {
		res.render('profile.handlebars', {
			user: req.user,
			message: req.flash('connectMessage'),
			isLoggedIn: req.isAuthenticated()
		});
	});

	//Req.Logout is called which is a function that has been exposed to the req object by passport-js
	//It deletes the req.user object, if this fails to work (it didnt once) use req.session.destroy()
	//instead luke.
	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	//--------Authentication-Paths----------
	//Fours paths are defined here, three times each for different scenarios
	//Local, Facebook, Twitter and Google are defined for three routes
	//-----1.logging in with that user account as the main.
	//-----2.connecting that account to another main.
	//-----3.unlinking an account from a main.
	//Signup and Login are also defined to read/write information from the db

	//Local - Show the login form
	app.get('/login', function (req, res) {
		res.render('login.handlebars', {
			message: req.flash('loginMessage'),
			isLoggedIn: req.isAuthenticated()
		});
	});

	//As with contact page get form data and authenticate using local login stratergy
	//defined in '../config/passport.js'. If successful goto /profile route else go back to 
	//login page. Allow flash messages so information can be passed to the user from passport
	//such as user account already exists.
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	}));

	//Local - Show the signup form
	app.get('/signup', function (req, res) {
		res.render('signup.handlebars', {
			message: req.flash('signupMessage'),
			isLoggedIn: req.isAuthenticated()
		});
	});

	//Same process as local login process but user local-signup stratergy to authenticate
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	//Facebook Login - Send the user to the facebook sign in (configured at the Facebook Dev Portal)
	//Use facebook passport stratergy defined in '../config/passport.js'.
	//Scope tells Facebook what information/permissions you require. In this case just email.
	app.get('/auth/facebook', isLoggedIn, passport.authenticate('facebook', {
		scope: 'email'
	}));

	//This is the route the Facebook auth page will sent the user too so handle it. Different to login
	//and sign-up due no flash messages able to be passed from facebook to client (errors shown on facebook)
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect: '/profile',
			failureRedirect: '/profile',
			failureFlash: true
		})
	);

	//Twitter Login - Send the user to the Twitter sign in (configured at the Twitter Dev Portal)
	//Scope tells Twitter what information/permissions you require. In this case just email.
	app.get('/auth/twitter', isLoggedIn, passport.authenticate('twitter', {
		scope: 'email'
	}));

	//Same as Facebook, handle the callback defined in the Twitter dev portal and direct to profile page
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect: '/profile',
			failureRedirect: '/profile',
			failureFlash: true
		})
	);

	//Google Login - Send the user to the Google sign in (configured at the Google Dev Portal)
	//Scope tells Twitter what information/permissions you require. In this case just email and
	//profile as it is not delivered by default. (Not public record).
	app.get('/auth/google', isLoggedIn, passport.authenticate('google', {
		scope: ['profile', 'email']
	}));

	//Same as Twitter, handle the callback defined in the Twitter dev portal and direct to profile page
	app.get('/auth/google/callback',
		passport.authenticate('google', {
			successRedirect: '/profile',
			failureRedirect: '/profile',
			failureFlash: true
		})
	);

	//--------Authentication-Paths----------
	//-------When-Already-Connected---------
	//TODO: Add callbacks (from domain and to callback) to all developer pages for this

	//Removed Connect Local (Making it mandatory)
	//Local - Connect show connect-local page, identical to signup page except action on form is 
	//different which connects the account rather than logging in to one
	/*app.get('/connect/local', function (req, res) {
		res.render('connect-local.handlebars', {
			message: req.flash('loginMessage'),
			isLoggedIn: req.isAuthenticated()
		});
	});

	//Manage the form on the page using local-signup stratrgy (Sign the user up and link)
	//Redirect back to the connect-local signup page if there is an error
	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/connect/local',
		failureFlash: true
	}));*/

	//Facebook - Connect Send to facebook to do the authentication
	app.get('/connect/facebook', isLoggedIn, passport.authorize('facebook', {
		scope: 'email'
	}));

	//If Facebook authorised the user handle the callback that was sent back 
	app.get('/connect/facebook/callback',
		passport.authorize('facebook', {
			successRedirect: '/profile',
			failureRedirect: '/profile'
		})
	);

	//Twitter - Connect Send to Twitter to do the authentication
	app.get('/connect/twitter', isLoggedIn, passport.authorize('twitter', {
		scope: 'email'
	}));

	//If Twitter authorised the user handle the callback that was sent back 
	app.get('/connect/twitter/callback',
		passport.authorize('twitter', {
			successRedirect: '/profile',
			failureRedirect: '/profile'
		})
	);

	//Google - Connect Send to Google to do the authentication
	app.get('/connect/google', isLoggedIn, passport.authorize('google', {
		scope: ['profile', 'email']
	}));

	//If Google authorised the user handle the callback that was sent back 
	app.get('/connect/google/callback',
		passport.authorize('google', {
			successRedirect: '/profile',
			failureRedirect: '/profile'
		})
	);

	//--------Authentication-Paths----------
	//--------Unlink-When-Connected---------
	//For local accounts remove both email and hashed password, for social just remove the
	//token incase they want to reconnect in the future.

	//Local - Unlink. Reference user object and nullify all loacl values. On save redirect to 
	//profile to show it is unlinked (Safe is defines as part of the user obj in passport.js)
	//unlinking local deletes all accounts
	app.get('/unlink/local', isLoggedIn, function (req, res) {
		var user = req.user;

		deleteUserByID(user._id);

		user.save(function (err) {
			res.redirect('/');
		});
	});

	//Facebook - Unlink. Reference user object and nullify facebook login.
	app.get('/unlink/facebook', isLoggedIn, function (req, res) {
		var user = req.user;
		user.facebook = undefined;
		user.save(function (err) {
			res.redirect('/profile');
		});
	});

	//Twitter - Unlink. Reference user object and nullify twitter login.
	app.get('/unlink/twitter', isLoggedIn, function (req, res) {
		var user = req.user;
		user.twitter = undefined;
		user.save(function (err) {
			res.redirect('/profile');
		});
	});

	//Google - Unlink. Reference user object and nullify google login.
	app.get('/unlink/google', isLoggedIn, function (req, res) {
		var user = req.user;
		user.google = undefined;
		user.save(function (err) {
			res.redirect('/profile');
		});
	});

	//Use Middleware to stop any route requests here and display a 404. Always keep at 
	//the bottom of the file because it means no routes could be found this line so 404
	app.use(function (req, res) {
		res.type('text/html');
		res.status(404);
		res.render('404', {
			isLoggedIn: req.isAuthenticated()
		});
	});

	//If no routes matched above like 404 and server error point to 500 page
	app.use(function (err, req, res, next) {
		console.error(err.stack);
		res.status(500);
		res.render('500', {
			isLoggedIn: req.isAuthenticated()
		});
	});

};

//Fetch a user from the db by ID and delete
function deleteUserByID(userID) {
	var User = require('../app/models/user.js');
	User.findByIdAndRemove(userID, function (err) {
		if (err) throw err;
		//We have deleted the user function is here only to display errors
	});
}

//Route Middleware defined for use in app.get to protect routes, returns next if true
//allowing route function to happen else it redirects to / route
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}