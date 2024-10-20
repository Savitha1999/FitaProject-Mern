const mongoose = require('mongoose');

const TestSchema = mongoose.Schema({
   
    name: 
    { 
        type: String, 
        required: [true , "Enter Your Name"]
    },
    
    course: 
    { 
        type: String, 
        required: [true , "Enter Your Course"]
    },
    photo: 
    { 
        type: String, 
        required: true 
    },
    textarea:
    {
        type:String,
        required : [true , "Type Your FeedBack"]
    },

    status:
    {
        type:Boolean,
        default:false

    }

});

module.exports = mongoose.model('TestData', TestSchema );