var mongoose = require('mongoose');
var order = require('./orders.js');

var customer_schema = mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    sales_notes: [{
        date: Date,
        salesperson_id: Number,
        notes: String,
    }],
});

customer_schema.methods.get_orders = () => {
    return order.find({customer_id : this._id});
}

var customer = mongoose.model('customer', customer_schema);
module.exports = customer; 