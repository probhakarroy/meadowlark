var mongoose = require('mongoose');

var vacation_in_season_listener_schema = mongoose.Schema({
    email : String,
    skus : [String],
});

var vacation_in_season_listener = mongoose.model('vacation_in_season_listener', vacation_in_season_listener_schema);

module.exports = vacation_in_season_listener;