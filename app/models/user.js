//Require both mongoose (To specify the Schema for the Database) and bcrypt so passwords aren't stored
//Passowrds will be stored as a hash and using salting techniques so in the event of a breach the 
//hacker can't log in to anyones account unless they asl have the hash secret and username
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//This is the schema that will be used for the user model in ../config/passport.js
var userSchema = mongoose.Schema({
	local: {
		email: String,
		password: String,
		full_name: String
	},
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	twitter: {
		id: String,
		token: String,
		displayName: String,
		username: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	updated_at: Date,
	created_at: false

});

//Methods to place in the schema include generating the passowrd hash and comparing it to a string password
userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Checks if the passowrd is valid by comparing the has to the stored value
userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.local.password);
};

//Just before saving update fields
userSchema.pre('save', function (next) {

	var currentDate = new Date();
	this.updated_at = currentDate;
	console.log(this._id);
	//If not initialised, set value
	if (!this.created_at)
		this.created_at = currentDate;

	next();
});

var User = mongoose.model('User', userSchema);
//Initilise the above model and allow acces from the application
module.exports = User;