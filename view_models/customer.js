var Customer = require('../models/customer.js');
// convenience function for joining fields
var smart_join = (arr, separator) => {
    if (!separator) separator = ' ';
    return arr.filter((elt) => {
        return elt !== undefined &&
            elt !== null &&
            elt.toString().trim() !== '';
    }).join(separator);
}

module.exports = (customerId) => {
    var customer = Customer.findById(customerId);
    if (!customer) return {
        error: 'Unknown customer ID: ' +
            // eslint-disable-next-line no-undef
            req.params.customerId
    };
    // eslint-disable-next-line no-unused-vars
    var orders = customer.get_orders().map((order) => {
        return {
            order_number: order.order_number,
            date: order.date,
            status: order.status,
            url: '/orders/' + order.order_number,
        }
    });

    return {
        first_name: customer.first_name,
        last_name: customer.last_name,
        name: smart_join([customer.first_name, customer.last_name]),
        email: customer.email,
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        full_address: smart_join([
            customer.address1,
            customer.address2,
            customer.city + ', ' +
            customer.state + ' ' +
            customer.zip,
        ], '<br>'),
        phone: customer.phone,
        orders: customer.get_orders().map((order) => {
            return {
                order_number: order.order_number,
                date: order.date,
                status: order.status,
                url: '/orders/' + order.order_number,
            }
        }),
    }
}