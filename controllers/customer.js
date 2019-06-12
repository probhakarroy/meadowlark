var Customer = require('../models/customer.js');
var customerViewModel = require('../view_models/customer.js');

exports = {
    register_routes : (app) => {
        app.get('/customer/:id', this.home);
        app.get('/customer/:id/preferences', this.preferences);
        app.get('/orders/:id', this.orders);
        app.post('/customer/:id/update', this.ajaxUpdate);
    },
    
    home : (req, res, next) => {
        var customer = Customer.findById(req.params.id);
        if (!customer) return next();
        // pass this on to 404 handler
        res.render('customer/home', customerViewModel(customer));
    },
    
    preferences : (req, res, next) => {
        var customer = Customer.findById(req.params.id);
        if (!customer) return next();
        // pass this on to 404 handler
        res.render('customer/preferences', customerViewModel(customer));
    },

    orders : (req, res, next) => {
        var customer = Customer.findById(req.params.id);
        if (!customer) return next();
        // pass this on to 404 handler
        res.render('customer/preferences', customerViewModel(customer));
    },

    ajaxUpdate : (req, res) => {
        var customer = Customer.findById(req.params.id);
        if (!customer) return res.json({ error: 'Invalid ID.' });
        if (req.body.firstName) {
            if (typeof req.body.firstName !== 'string' ||
                req.body.firstName.trim() === '')
                return res.json({ error: 'Invalid name.' });
            customer.firstName = req.body.firstName;
        }
        // and so on....
        customer.save();
        return res.json({ success: true });
    }
}