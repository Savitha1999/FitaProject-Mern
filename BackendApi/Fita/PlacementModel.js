// PlacementModel.js
const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    placementCompany: { type: String, required: true },
    position: { type: String, required: true },
    course: { type: String, required: true },
    photo: { type: String, required: true }
});

module.exports = mongoose.model('Placement', placementSchema);
