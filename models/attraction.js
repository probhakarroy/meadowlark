var mongoose = require('mongoose');

var attraction_schema = mongoose.Schema({
    name : String,
    description : String,
    location : {
        lat : Number,
        lng : Number,
    },
    history : {
        event : String,
        notes : String,
        email : String,
        date : Date,
    },
    updateId : String,
    approved : Boolean,
});

var attraction = mongoose.model('attraction', attraction_schema);
module.exports = attraction;