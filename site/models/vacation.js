var mongoose = require('mongoose');

var vacation_schema = mongoose.Schema({
    name : String,
    slug : String,
    category : String,
    sku : String,
    description : String,
    price_in_cents : Number,
    tags : [String],
    in_season : Boolean,
    available : Boolean,
    requires_waiver : Boolean,
    maximum_guests : Number,
    notes : String,
    packages_sold : Number,
});

vacation_schema.methods.get_display_price = () => {
    return '$ ' + (this.price_in_cents/100).toFixed(2);
}

var Vacation = mongoose.model('Vacation', vacation_schema);
module.exports = Vacation;
