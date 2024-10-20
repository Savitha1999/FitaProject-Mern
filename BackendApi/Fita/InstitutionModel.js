const mongoose = require('mongoose');

const InstitutionSchema = mongoose.Schema({
   
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

module.exports = mongoose.model('Institution', InstitutionSchema);