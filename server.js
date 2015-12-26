// server.js

// setup ======================================================================
// get all the tools we need
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); //pass passport for configuration

//set up our express application
app.use('/public', express.static(process.cwd() + '/public'));
app.use(morgan('dev')); //log every request to the console
app.use(cookieParser()); //read cookies (needed for auth)
app.use(bodyParser()); //get information from html forms

app.set('view engine', 'jade'); //set up jade for templating

// required for passport
app.use(session({secret:'6qgGTS623NI8o39Nqo65lawwpR4Z5twp'})); //session secret
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash()); //use connect-flash for flash messages stored in session

require('./app/models/user.js');
require('./app/models/polls.js');
// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic is happening on port '+port);