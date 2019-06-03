module.exports = {
    check_waivers: function (req, res, next) {
        var cart = req.session.cart;
        if (!cart) return next();
        if (cart.some(function (i) { return i.product.requires_waiver; })) {
            if (!cart.warnings) cart.warnings = [];
            cart.warnings.push('One or more of your selected tours requires a waiver.');
        }
        next();
    },
    check_guest_counts: function (req, res, next) {
        var cart = req.session.cart;
        if (!cart) return next();
        if (cart.some(function (item) {
            return item.guests >
                item.product.maximum_guests;
        })) {
            if (!cart.errors) cart.errors = [];
            cart.errors.push('One or more of your selected tours cannot accommodate the number of guests you have selected.');
        }
        next();
    }
}