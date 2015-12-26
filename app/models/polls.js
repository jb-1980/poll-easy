// app/model/user.js
// load the things we need
var mongoose = require('mongoose');
var generateSlug = require('mongoose-slugs');

// define the schema for our user model
var pollSchema = mongoose.Schema({
    owner:{type:mongoose.Schema.ObjectId,ref:'User',index:true},
    hidden:Boolean,
    question:String,
    question_slug:{type:String,index:true},
    options:[String],
    responses:[{
        response:String
    }]
});

// create a valid url slug for question name
pollSchema.methods.slugify = function(text){
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
};

//create the model for users and expose it to our app
module.exports = mongoose.model('Polls',pollSchema);