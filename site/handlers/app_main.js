var vacation_in_season_listerner = require('../models/vacation_in_season_listener.js'); //Db model

//local modules
var fortune = require('../lib/fortune.js');
var newsletter = require('../lib/newsletter.js');//dummy newsletter_signup function 
var common_regex = require('../lib/common_regex.js');//common regexs



//route handler
exports.home = (req, res) => {
    res.render('home');
}

exports.about = (req, res) => {
    res.render('about', {
        fortune: fortune.get_fortune(),
        pageTestScript: '../qa/tests-about.js'
    });
}

//form handling
exports.newsletter_get = (req, res) => {
    res.render('newsletter', { csrf: 'csrf_token' });
}

//experimentin with express-session
exports.newsletter_post = (req, res) => {
    var name = req.body.name || '', email = req.body.email || '';

    //input validation
    if (!email.match(common_regex.VALID_EMAIL_REGEX)) {
        if (req.xhr) return res.json({ error: 'Invalid email address.' });
        req.session.flash = {
            type: 'danger',
            intro: 'Validation Error!',
            message: 'The email address you entered was not valid.',
        };
        return res.redirect(303, '/newsletter/archive');
    }

    new newsletter.newsletter_signup({ name: name, email: email }).save((err) => {
        if (err) {
            if (req.xhr) return res.json({ error: 'Database Error.' });
            req.session.flash = {
                type: 'danger',
                intro: 'Database Error!',
                message: 'There was a database error; please try again letter.',
            }
            return res.redirect(303, '/newsletter/archive');
        }
        if (req.xhr) return res.json({ success: true });
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!!',
            message: 'You have now been signed up for newsletter.',
        };
        return res.redirect(303, '/newsletter/archive');
    });
}

exports.set_currency = (req, res) => {
    req.session.currency = req.params.currency;
    return res.redirect(303, '/vacations');
}

//push data in Db
exports.notify_me_when_in_season_get = (req, res) => {
    res.render('notify-me-when-in-season', { sku: req.query.sku });
}

exports.notify_me_when_in_season_post = (req, res) => {
    vacation_in_season_listerner.update(
        { email: req.body.email },
        { $push: { skus: req.body.sku } },
        { upsert: true },
        (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err.stack);
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: 'There was an error processing your request.',
                };
                return res.redirect(303, '/vacations');
            }
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'You will be notified when this vacation is in season.',
            };
            return res.redirect(303, '/vacations');
        }
    );
}

