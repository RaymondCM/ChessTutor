//By using module.export this information is accessable directly from the application entry-point (server.js)
//These are the credentials used to authenticate through Facebook, Twitter and Google
//callbackURL is the rote the provider sends the user too after sucessful authentication.

module.exports = {

	'facebookAuth': {
		'clientID': '1711930759063681',
		'clientSecret': '5677a5b93808b048a1f3b9ba93c61ea4',
		'callbackURL': 'http://localhost:8080/auth/facebook/callback'
	},

	'twitterAuth': {
		'consumerKey': 'nG8WOoqzQ4EoQVPXedN85ZiMg',
		'consumerSecret': 'Q0U5f9qXnQYo2jz7weV22xrHRBHM6UhOJTGFGdB3ZryAxZSsEt',
		'callbackURL': 'http://127.0.0.1:8080/auth/twitter/callback'
	},

	'googleAuth': {
		'clientID': '32752818630-os8htbf8fn5kjt1lg449kfntiiv7pj8h.apps.googleusercontent.com',
		'clientSecret': '-b9RAtGeUElbE08idrSbrPeX',
		'callbackURL': 'http://localhost:8080/auth/google/callback'
	}

};