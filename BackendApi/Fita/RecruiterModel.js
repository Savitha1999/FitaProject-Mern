const mongoose = require('mongoose');

const RecruiterSchema = mongoose.Schema({
   
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [/.+@.+\..+/, "Please enter a valid email"]
    },
    password:
    {
        type:String,
        required:[true, "Password is requried"]
    }

});

module.exports = mongoose.model('Recruiter', RecruiterSchema);