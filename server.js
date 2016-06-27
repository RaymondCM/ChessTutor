//Server File. (Links mLab(where our db is hosted):https://mlab.com/databases/chesstutor#stats, Social Dev logins(Google them))
//Express required for routing, Mongoose is required to define the schema for the database,
//Passport handles the authentication via local or social, Flash allows the client to recieve
//data from the response obect via the templating language. Morgan logs client requests to the server,
//Cookie parser is pretty self explanatory haha, Bodyparser allows the req to eassily read forms.
//Session allows the user to stay logged in via the secret JSON token.

var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var databaseURL = require('./config/database.js');

//----------Server-Config-------------

//Connect to the Database (URL defined in './config/database.js' as stated above).
mongoose.connect(databaseURL.url);
//Load the config for passport here (via module.export, just helps have a cleaner server file)
require('./config/passport')(passport);

//Use express app with morgan so the requests log to the console, allow app to read cookies and forms
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//Handlebars templating engine setup, Tell it to use main as a default website
//TODO: Turn on handlebars aggresive caching.
var handlebars = require('express-handlebars').create({
	defaultLayout: 'main'
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//Secret that is used for the hashing in passport (must be unique to this server). 
//Keeps the session and validates them with this secret
app.use(session({
	secret: 'raymondkirkchesstutoruwhatm8797'
}));

//Set up passport, enable the persistant setting option and flash-messages
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Serve the HTML files statically
app.use(express.static(__dirname + '/public'));

//Load in the routes (via module.exports) helps keep the server file clean.
//Pass in the fully configured passport and app to routes when loading in.
require('./app/routes.js')(app, passport);

//Start the Server
app.listen(port, function () {
	console.log('Started Chess Tutor on :*' + port);
});