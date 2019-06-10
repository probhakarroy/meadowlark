var fs = require('fs'); //fs module
var formidable = require('formidable'); //form handling module
var Vacation = require('../models/vacation.js'); //Db model


//local modules
var gcs = require('../lib/gcloud.js');
var email_service = require('../lib/email.js'); //email functionality encapsulation
var common_regex = require('../lib/common_regex.js');//common regexs
var credentials = require('../lib/credentials.js');
var currency_converter = require('../lib/currency_converter.js');

//email & gcs service credentials
email_service = email_service(credentials);
gcs = gcs(credentials);

//creating Db data
Vacation.find((err, vacation) => {
    if (vacation.length) return;

    new Vacation({
        name: 'Hood River Day Trip',
        slug: 'hood-river-day-trip',
        category: 'Day Trip',
        sku: 'HR199',
        description: 'Spend a day sailing on the Columbia and ' +
            'enjoying craft beers in Hood River!',
        price_in_cents: 29995,
        tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
        in_season: true,
        maximum_guests: 16,
        available: true,
        packages_sold: 0,
    }).save();

    new Vacation({
        name: 'Oregon Coast Getaway',
        slug: 'oregon-coast-getaway',
        category: 'Weekend Getaway',
        sku: 'OC39',
        description: 'Enjoy the ocean air and quaint coastal towns!',
        price_in_cents: 269995,
        tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
        in_season: false,
        maximum_guests: 8,
        available: true,
        packages_sold: 0,
    }).save();

    new Vacation({
        name: 'Rock Climbing in Bend',
        slug: 'rock-climbing-in-bend',
        category: 'Adventure',
        sku: 'B99',
        description: 'Experience the thrill of climbing in the high desert.',
        price_in_cents: 289995,
        tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
        in_season: true,
        requires_waiver: true,
        maximum_guests: 4,
        available: false,
        packages_sold: 0,
        notes: 'The tour guide is currently recovering from a skiing accident.',
    }).save();
});


//for integration testing
exports.tours_hood_river = (req, res) => {
    res.render('tours/hood-river');
}

exports.tours_oregon_coast = (req, res) => {
    res.render('tours/oregon-coast');
}

exports.tours_request_group_rate = (req, res) => {
    res.render('tours/request-group-rate');
}

//form handling file upload
exports.contest_vacation_photo_get = (req, res) => {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    });
}

// eslint-disable-next-line no-undef
var data_dir = './data';
var vacation_photo_dir = data_dir + '/vacation-photo';
fs.existsSync(data_dir) || fs.mkdirSync(data_dir);
fs.existsSync(vacation_photo_dir) || fs.mkdirSync(vacation_photo_dir);

// eslint-disable-next-line no-unused-vars
var save_contest_entry = (contest_name, email, year, month, photo_path) => {
    //TODO
}

exports.contest_vacation_photo_post = (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) return res.redirect(303, '/error');
        if (err) {
            res.session.flash = {
                type: 'danger',
                intro: 'Oops!',
                message: 'There was an error processing your submission. Please try again.'
            };
            return res.redirect(303, '/contest/vacation-photo');
        }
        var photo = files.photo;
        var dir = vacation_photo_dir + '/' + Date.now();
        var path = dir + '/' + photo.name;
        fs.mkdirSync(dir);
        fs.renameSync(photo.path, dir + '/' + photo.name);
        save_contest_entry('vacation-photo', fields.email, req.params.year, req.params.month, path);

        // eslint-disable-next-line no-unused-vars
        gcs.file_upload(dir + '/' + photo.name, 'simplica');

        req.session.flash = {
            type: 'success',
            intro: 'Good Luck!',
            message: 'You have been entered into the contest.'
        }

        return res.redirect(303, '/contest/vaction-photo/entries');
    });
}

//handling of cart-checkout using email.
exports.cart_checkout_post = (req, res) => {
    var cart = req.session.cart;
    if (!cart) res.next(new Error('Cart does not exist.'));

    var name = req.body.name || '', email = req.body.email || '';

    //input validation
    if (!email.match(common_regex.VALID_EMAIL_REGEX))
        return res.next(new Error('Invalid email address.'));

    //assign a random cart ID; normally we use a database ID here
    cart.number = Math.random().toString().replace(/^0\.0*/, '');
    cart.billing = {
        name: name,
        email: email
    };

    res.render('email/cart-thank-you', {
        layout: null,
        cart: cart
    }, (err, html) => {
        // eslint-disable-next-line no-console
        if (err) console.error('error in email template');
        email_service.send(cart.billing.email, 'Thank You for Booking wour Trip with Meadowlark', html);
    });

    res.render('cart-thank-you', { cart: cart });
}

//adding Db persistence
exports.vacations = (req, res) => {
    Vacation.find({ available: true }, (err, vacations) => {
        var currency = req.session.currency || 'USD';
        var context = {
            currency: currency,
            vacations: vacations.map((vacation) => {
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    price: currency_converter.convert_from_USD(vacation.price_in_cents / 100, currency),
                    in_season: vacation.in_season,
                    qty: vacation.qty
                }
            })
        };

        switch (currency) {
            case 'USD':
                context.currencyUSD = 'selected';
                break;

            case 'GBP':
                context.currencyGBP = 'selected';
                break;

            case 'BTC':
                context.currencyBTC = 'selected';
                break;
        }
        res.render('vacations', context);
    });
}
