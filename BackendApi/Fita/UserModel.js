

const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter Your Name"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [/.+@.+\..+/, "Please enter a valid email"]
    },
    phone: {
        type: Number,
        min: [1000000000, "Phone No is Invalid"]
    },
    qualification: {
        type: String,
        required: [true, "Qualification is required"]
    },
    passingOutYear: {
        type: Number,
        required: [true, "Passing Out Year is required"]
    },
    resume: {
        type: String
    },
    course: {
        type: String,
        required: [true, "Course is required"]
    },
    experience: {
        type: String,
        required: [true, "Experience is required"]
    },
    position: {
        type: String,
        required: [true, "Position is required"]
    },
    portfolioLink: {
        type: String
    },
    photo: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("UserData", UserSchema);
