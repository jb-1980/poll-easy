'use strict';
// app/controllers/mypolls.server.js

var Users = require('../models/user.js');
var Polls = require('../models/polls.js');


function PollHandler () {

    this.getMyPolls = function(req,res){
        // get all Polls for authenticated user
        Polls
            .find({'owner':req.user},function(err,polls){
                if(err)
                    throw err;
                
                res.render('mypolls/home.jade',{
                    user : req.user, // get the user out of session and pass to template
                    polls: polls
                });
        });
    };
    
    this.addPoll = function(req,res){
        var question = req.param('question');
        var hidden = req.param('hidden') ? true : false;
        console.log(req.param('hidden'),hidden);
        Polls
            .find({'owner':req.user,'question':question},function(err,poll){
                if(err)
                    throw err;
                if(poll.length > 0){
                    console.log(poll);
                    return res.render('mypolls/createpoll.jade',{
                        user:req.user,
                        message:'You already have a poll for this question.&lt;br&gt;Please use a new question.',
                        polls:null
                    });
                }  
                var newPoll = new Polls();
                newPoll.owner = req.user;
                newPoll.question = question;
                newPoll.question_slug = newPoll.slugify(question);
                newPoll.options = req.param('options');
                newPoll.hidden = hidden;
                
                newPoll.save(function(err){
                    if(err)
                        throw err;
                });
                
                res.redirect('/mypolls');
        });
    };
    
    this.deletePoll = function(req,res){
        var poll_id = req.param('poll_id');
        Polls.remove({_id:poll_id},function(err,removed){
            if(err)
                throw err;
            
            res.json(JSON.stringify(removed));
        });
    };
    
    this.getPolls = function(req,res){
        Polls
            .find({hidden:false})
            .populate('owner')
            .exec(function(err,polls){
                if(err)
                    throw err;
                
                res.render('viewpolls.jade',{
                    user:req.user,
                    polls:polls
                });
            });
    };
    
    this.viewPoll = function(req,res){
        var username_slug = req.params.user;
        var question_slug = req.params.question;
        Users
          .findOne({'local.username_slug':username_slug},function(err,founduser){
             if(err)
                 throw err;

             Polls
               .findOne({
                 owner:founduser._id,
                 question_slug:question_slug})
               .populate('owner')
               .exec(function(err,poll){
                   if(err)
                       throw err;
                   var data = {};
                   for(var i=0;i<poll.options.length;i++){
                       data[poll.options[i]]=0;
                   }
                   var filtered = poll.responses.filter(function(response){
                       data[response.response]++;
                   });

                   res.render('viewpoll.jade',{
                      user:req.user,
                      poll:poll,
                      data:data,
                      url:req.protocol + '://' + req.get('host') + req.originalUrl
                   });
             })
        });
    };
    
    this.addResponseForm = function(req,res){
        var pollid = req.params.poll_id;
        Polls.findOne({_id:pollid})
             .populate('owner')
             .exec(function(err,poll){
                  if(err)
                      throw err;
                  
                  res.render('addresponse.jade',{
                      poll:poll,
                      url:req.protocol+'://'+req.get('host')+'/viewpoll/'+poll.owner.local.username_slug+'/'+poll.question_slug
                  });
              });
    };
    
    this.addResponse = function(req,res){
        var pollid = req.params.poll_id;
        Polls
          .findOneAndUpdate({_id:pollid},
            {$push: { 
                responses : {
                    'response':req.param('optionsRadios')
                }
             }},
             {upsert:true})
          .populate('owner')
          .exec(function(err, poll) {
                if(err)
                    throw err;
                var data = {};
                for(var i=0;i<poll.options.length;i++){
                    data[poll.options[i]]=0
                }
                var responded = poll.responses.filter(function(response){
                    data[response.response]++;
                });
                console.log(responded);
                var url = '/viewpoll/'+poll.owner.local.username_slug+'/'+poll.question_slug
                res.redirect(url);
             }
        );
    };
}

module.exports = PollHandler;