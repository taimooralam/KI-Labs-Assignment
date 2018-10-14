var Restaurant = require('../app/models/restaurant');

exports.getRestaurantFromCode = async (restaurantCode) => {
    var restaurant = await Restaurant.findOne({code:restaurantCode}, {__v:0}).lean().exec();
    return restaurant;
}