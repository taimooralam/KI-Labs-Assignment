//app/models/restaurant.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


RestaurantSchema = new Schema({
    name: String,
    code: String,
    status: Boolean
},{ versionKey: false });

module.exports = mongoose.model('Restaurant', RestaurantSchema);