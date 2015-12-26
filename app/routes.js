// app/routes.js

var path = process.cwd();
var MyPollsHandler = require(path + '/app/controllers/mypolls.server.js');

module.exports = function(app,passport){
    // ===================================
    // HOME PAGE (with login links) ======
    // ===================================
    app.get('/',function(req,res){
       res.render('index.jade',{
           user:req.user
       });// load the index.ejs file 
    });
    
    // ===================================
    // LOGIN =============================
    // ===================================
    // show the login form
    app.route('/login')
       .get(function(req,res){
            //render the page in any flash data if it exists
            res.render('login.jade',{
                message:req.flash('loginMessage'),
                user:req.user
            });
        })
        .post(passport.authenticate('local-login',{
        successRedirect:'/login/success',//redirect to the secure section
        failureRedirect:'/login',//redirect to the login page is there is an error,
        failureFlash: true // allow flash messages
    }));
    
    app.get('/login/success', function(request, response) {
      response.redirect(request.session.lastUrl || '/');
    });
    
    // ===================================
    // SIGNUP ============================
    // ===================================
    // show the signup form
    app.get('/signup',function(req,res){
        //render the page and pass in any flash data if it exists
        res.render('signup.jade',{
            message:req.flash('signupMessage'),
            user:req.user
        });
    });
    
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup',{
        successRedirect:'/mypolls',//redirect to the secure mymissions section
        failureRedirect:'/signup',//redirect back to the signup page if there is an error
        failureFlash:true
    }));
    
    // ===================================
    // PROFILE SETTINGS SECTION ==========
    // ===================================
    // we will want this protected so you have to logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile',isLoggedIn,function(req,res){
        res.render('profile.jade',{
            user : req.user // get the user out of session and pass to template
        });
    });
    
    // ===================================
    // LOGOUT ============================
    // ===================================
    app.get('/logout',function(req,res){
        req.logout();
        res.redirect('/');
    });
    
    // ===================================
    // MY POLLS SECTION ==================
    // ===================================
    var myPolls = new MyPollsHandler();
    app.get('/mypolls',isLoggedIn,myPolls.getMyPolls);
    
    // ===================================
    // CREATE POLLS SECTION ==============
    // ===================================
    app.route('/mypolls/createpoll')
       .get(isLoggedIn,function(req,res){
           res.render('mypolls/createpoll.jade',{
               user:req.user
           })
       })
       .post(isLoggedIn,myPolls.addPoll)
    
    // ==================================
    // DELETE POLL SECTION ==============
    // ==================================
    app.delete('/mypolls/delete',isLoggedIn,myPolls.deletePoll);
    
    // ==================================
    // VIEW POLL SECTION ================
    // ==================================
    app.route('/viewpoll/:user/:question')
       .get(myPolls.viewPoll);
    // ==================================
    // VIEW POLLS SECTION ===============
    // ==================================
    app.route('/viewpolls')
       .get(myPolls.getPolls);
    
    // ==================================
    // ADD RESPONSE SECTION =============
    // ==================================
    app.route('/addresponse/:poll_id')
       .get(myPolls.addResponseForm)
       .post(myPolls.addResponse);
    // APIS /////////////////////////////
    
    // ==================================
    // ADD OPTION =======================
    // ==================================
};

// route middleware to make sure a user is logged in
function isLoggedIn(req,res,next){
  // Store secured url for redirect after successful login
  req.session.lastUrl = req.originalUrl;
  
  //if user autheticated in the session, carry on
  if(req.isAuthenticated())
      return next();
  
  // if they aren't redirect them to the login page
  res.redirect('/login');
}