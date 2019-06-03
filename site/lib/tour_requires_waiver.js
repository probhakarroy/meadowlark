module.exports = (req, res, next) => {
    var cart = req.session.cart;
    if(!cart) return next();
    if(cart.some((item) => {
        return item.product.requires_waiver;
    })){
        if(!cart.warnings) cart.warnings = [];
        cart.warnings.push('one or more of your selected tours requires a waiver.');
    }
    next();
}