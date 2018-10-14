//app/models/restaurant.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


InterviewerSchema = new Schema({
    name: { type: String, required: [true, 'Please add name: String']},
    availability: [{
        to: {
            type: Date,
            required: [true, "Please add the starting timestamp"]
        },
        from: {
            type: Date,
            required: [true, "Please add the ending timetamp"]
        }
    }]
},{ versionKey: false });

module.exports = mongoose.model('Interviewer', InterviewerSchema);