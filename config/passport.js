// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport){
    // =========================================================================
    // passport session startup ================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    
    // used to serialize the user for the session
    passport.serializeUser(function(user,done){
        done(null,user.id);
    });
    
    // user to deserialize the user
    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user){
            done(err,user);
        });
    });
    
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local
    
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy user username and password,
        // to override with email, for example, uncomment below code
        //usernameField:'email',
        //passwordField:'password',
        passReqToCallback:true // allows us to pass back the entire request to the callback
    },
    function(req,username,password,done){
        //asynchronous
        // User.findOne won't fire unless data is sent back
        console.log('here')
        process.nextTick(function(){
            // find a user whose username is the same as the forms username
            // we are checking to see if the user trying to login already exists
            User.findOne({'username':username},function(err,user){
                // if there are any error, return the error
                if(err)
                    return done(err);
                
                // check to see if there is already a user with that email
                if(user){
                    return done(null,false,req.flash('signupMesage','Sorry, that username is already taken.'));
                } else{
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();
                    
                    // set the user's local credentials
                    newUser.local.username = username;
                    newUser.local.username_slug = newUser.slugify(username);
                    newUser.local.password = newUser.generateHash(password);
                    newUser.local.firstname = req.param('firstname');
                    newUser.local.lastname = req.param('lastname');
                    
                    console.log(newUser)
                     
                    // save the user
                    newUser.save(function(err){
                        if(err)
                            throw err;
                        return done(null,newUser);
                    });
                }
            });
        });
    }));
    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using name strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy user username and password,
        // to override with email, for example, uncomment below code
        //usernameField:'email',
        //passwordField:'password',
        passReqToCallback:true // allows us to pass back the entire request to the callback
        
    },
    function(req,username,password,done){//calback with email and password from our form
        // find user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({'local.username':username} ,function(err,user){
            // if there are any errors, return the error before anything else
            if(err)
                return done(err);
            // if no user is found, return the message
            if(!user)
                return done(null,false,req.flash('loginMessage','No user found.')); //req.flash is the way to set flashdata using connect-flash
            
            // if the user is found but the password is wrong
            if(!user.validPassword(password))
                return done(null,false,req.flash('loginMessage','Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            
            // all is well, return successful user
            return done(null,user);
        });
    }));
};