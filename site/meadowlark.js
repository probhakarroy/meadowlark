var express = require('express');

//form handling module
var formidable = require('formidable');

//fs module
var fs = require('fs');

//Compression module
var compression = require('compression');

//email functionality encapsulation
var email_service = require('./lib/email.js');

//cross-site request forgery protection
//var csurf = require('csurf');

//cookies and session handling modules
var cookie_parser = require('cookie-parser');
var session = require('express-session');
var mongo_store = require('connect-mongo');

//logger
var morgan = require('morgan');

//express domain middleware
var domain = require('express-domain-middleware');

//ODM
var mongoose = require('mongoose');

//local libraries
var fortune = require('./lib/fortune.js');
var credentials = require('./lib/credentials.js');
var weather = require('./lib/weather_data.js'); //dummy weather data
var newsletter = require('./lib/newsletter.js');//dummy newsletter_signup function 
var common_regex = require('./lib/common_regex.js');//common regexs
var cart_validation = require('./lib/cart_validation.js');
var gcs = require('./lib/gcloud.js');
var currency_converter = require('./lib/currency_converter.js');

//Db models
var Vacation = require('./models/vacation.js');
var vacation_in_season_listerner = require('./models/vacation_in_season_listener.js');


var app = express();


//logger
switch(app.get('env')){
    case 'development' : 
        app.use(morgan('dev'));
        break;
    
    case 'production' :
        app.use(morgan('combined'));
        break;
}

//ODM connection
var opts = {
    keepAlive : 1,
    useNewUrlParser : true,
};

switch(app.get('env')){
    case 'development' :
        mongoose.connect(credentials.mongo.development.connection_string, opts)
            .then(() => {
                // eslint-disable-next-line no-console
                console.log('Successfully Connected to the '+app.get('env')+' Db');
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                if (err) return console.error('Error connecting to mongodb' + err);
            });
        break;
    
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts)
            .then(() => {
                // eslint-disable-next-line no-console
                console.log('Successfully Connected to the ' + app.get('env') + ' Db');
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                if (err) return console.error('Error connecting to mongodb' + err);
            });
        break;
    
    default :
        throw new Error('Unknown execution environment : ' + app.get('env'));
}

Vacation.find((err, vacation) => {
    if(vacation.length) return;

    new Vacation({
        name : 'Hood River Day Trip',
        slug : 'hood-river-day-trip',
        category : 'Day Trip',
        sku : 'HR199',
        description : 'Spend a day sailing on the Columbia and ' +
            'enjoying craft beers in Hood River!',
        price_in_cents : 29995,
        tags : ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
        in_season : true,
        maximum_guests : 16,
        available : true,
        packages_sold : 0,
    }).save();

    new Vacation({
        name : 'Oregon Coast Getaway',
        slug : 'oregon-coast-getaway',
        category : 'Weekend Getaway',
        sku : 'OC39',
        description : 'Enjoy the ocean air and quaint coastal towns!',
        price_in_cents : 269995,
        tags : ['weekend getaway', 'oregon coast', 'beachcombing'],
        in_season : false,
        maximum_guests : 8,
        available : true,
        packages_sold : 0,
    }).save();

    new Vacation({
        name : 'Rock Climbing in Bend',
        slug : 'rock-climbing-in-bend',
        category : 'Adventure',
        sku : 'B99',
        description : 'Experience the thrill of climbing in the high desert.',
        price_in_cents : 289995,
        tags : ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
        in_season : true,
        requires_waiver : true,
        maximum_guests : 4,
        available : false,
        packages_sold : 0,
        notes : 'The tour guide is currently recovering from a skiing accident.',
    }).save();
});

//email & gcs service credentials
email_service = email_service(credentials);
gcs = gcs(credentials);

//handlebars 
//creating sections
var sections = require('express-handlebars-sections');
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers : {
        section : sections()
    }
 });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// eslint-disable-next-line no-undef
app.set('port', process.env.PORT || 3000);

//disable server info
app.disable('x-powered-by');

// eslint-disable-next-line no-undef
app.use(express.static(__dirname+'/public'));

//using parser in app.js
app.use(express.json());
app.use(express.urlencoded({extended : false}));

//compression middleware
app.use(compression());

//connect-mongo
mongo_store = mongo_store(session);

//cookie-parser and session middlewares
app.use(cookie_parser(credentials.cookie_secret));
app.use(session({
    resave : false,
    saveUninitialized : false,
    secret : credentials.cookie_secret,
    store : new mongo_store({mongooseConnection : mongoose.connection})
}));

//csurf middleware linked after express-session middleware
//app.use(csurf());

//Unchaught Exception handling using Domains
app.use(domain);

//experimenting with middleware
app.use(cart_validation.check_waivers);
app.use(cart_validation.check_guest_counts);

//middleware for dummy weather partials
app.use((req, res, next) => {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather_data = weather.get_weather_data();
    next();
});

//page testing
app.use((req, res, next) => {
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

//flash messages
app.use((req, res, next) => {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

//app routes
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about', {
        fortune : fortune.get_fortune(), 
        pageTestScript : '/qa/tests-about.js'
    });
});

// experimenting with req and res headers
app.get('/headers', (req, res) => {
    res.type('text/plain');
    var s = '';
    for(var name in req.headers){
        s += name + ' : ' + req.headers[name] + '\n';
    }
    res.send(s);
});

app.get('/greetings', (req, res) => {
    res.render('about', {
        message : 'welcome',
        query : req.query,
        cookie : req.cookie,
        signed_cookie : req.signedCookies,
        session : req.session
    });
});

app.get('/no-layout', (req, res) => {
    res.render('no-layout', {layout : null});
});

app.get('/jquery-test', (req, res) => {
    res.render('jquery-test');
});

app.get('/nursery-rhyme', (req, res) => {
    res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function (req, res) {
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});

//for integration testing
app.get('/tours/hood-river', (req, res) => {
    res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', (req, res) => {
    res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', (req, res) => {
    res.render('tours/request-group-rate');
});

//form handling
app.get('/newsletter', (req, res) => {
    res.render('newsletter', {csrf : 'csrf_token'});
});

//experimentin with express-session
app.post('/newsletter', (req, res) => {
    var name = req.body.name || '', email = req.body.email || '';
    
    //input validation
    if(!email.match(common_regex.VALID_EMAIL_REGEX)){
        if(req.xhr) return res.json({error : 'Invalid email address.'});
        req.session.flash = {
            type : 'danger',
            intro : 'Validation Error!',
            message : 'The email address you entered was not valid.',
        };
        return res.redirect(303, '/newsletter/archive');
    }

    new newsletter.newsletter_signup({name : name, email : email}).save((err) => {
        if(err) {
            if(req.xhr) return res.json({error : 'Database Error.'});
            req.session.flash = {
                type : 'danger',
                intro : 'Database Error!',
                message : 'There was a database error; please try again letter.',
            }
            return res.redirect(303, '/newsletter/archive');
        }
        if(req.xhr) return res.json({success : true});
        req.session.flash = {
            type : 'success',
            intro : 'Thank you!!',
            message : 'You have now been signed up for newsletter.',
        };
        return res.redirect(303, '/newsletter/archive');
    });
});

//form handling file upload
app.get('/contest/vacation-photo', (req, res) => {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month : now.getMonth()
    });
});

// eslint-disable-next-line no-undef
var data_dir = __dirname+'/data';
var vacation_photo_dir = data_dir+'/vacation-photo';
fs.existsSync(data_dir) || fs.mkdirSync(data_dir);
fs.existsSync(vacation_photo_dir) || fs.mkdirSync(vacation_photo_dir);

var save_contest_entry = (contest_name, email, year, month, photo_path) => {
    //TODO
}

app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if(err) return res.redirect(303, '/error');
        if(err) {
            res.session.flash = {
                type : 'danger',
                intro : 'Oops!',
                message : 'There was an error processing your submission. Please try again.'
            };
            return res.redirect(303, '/contest/vacation-photo');
        }
        var photo = files.photo;
        var dir = vacation_photo_dir+'/'+Date.now();
        var path = dir+'/'+photo.name;
        fs.mkdirSync(dir);
        fs.renameSync(photo.path, dir+'/'+photo.name);
        save_contest_entry('vacation-photo', fields.email, req.params.year, req.params.month, path);
        
        // eslint-disable-next-line no-unused-vars
        gcs.file_upload(dir + '/' + photo.name, 'simplica');

        req.session.flash = {
            type : 'success',
            intro : 'Good Luck!',
            message: 'You have been entered into the contest.'
        }

        return res.redirect(303, '/contest/vaction-photo/entries');
    });
});

//handling of cart-checkout using email.
app.post('/cart/checkout', (req, res) => {
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
        if(err) console.error('error in email template');
        email_service.send(cart.billing.email, 'Thank You for Booking wour Trip with Meadowlark', html);
    });
    
    res.render('cart-thank-you', { cart: cart });
});

//Handling Uncaught Exceptions
// eslint-disable-next-line no-unused-vars
app.get('/epic-fail', (req, res) => {
    setTimeout(() => {
        throw new Error('Nope!');
    }, 0);
});

//adding Db persistence
app.get('/vacations', (req, res) => {
    Vacation.find({ available : true}, (err, vacations) => {
        var currency = req.session.currency || 'USD';
        var context = {
            currency : currency,
            vacations : vacations.map((vacation) => {
                return {
                    sku : vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    price: currency_converter.convert_from_USD(vacation.price_in_cents/100, currency),
                    in_season: vacation.in_season,
                    qty : vacation.qty
                }
            })
        };

        switch(currency){
            case 'USD' :
                context.currencyUSD = 'selected';
                break;
            
            case 'GBP' :
                context.currencyGBP = 'selected';
                break;

            case 'BTC' :
                context.currencyBTC = 'selected';
                break;
        }
        res.render('vacations', context);
    });
});

app.get('/set-currency/:currency', (req, res) => {
    req.session.currency = req.params.currency;
    return res.redirect(303, '/vactions');
});

//push data in Db
app.get('/notify-me-when-in-season', (req, res) => {
    res.render('notify-me-when-in-season', { sku: req.query.sku });
});

app.post('/notify-me-when-in-season', (req, res) => {
    vacation_in_season_listerner.update(
        { email : req.body.email },
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
})

//Custom 404 Page
app.use((req, res) => {
    res.status(404);
    res.render('404');
});

//Custom 500 page
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
   // eslint-disable-next-line no-console
   console.error(err.stack);
   res.status(500);
   res.render('500'); 
});

app.listen(app.get('port'), () => {
    // eslint-disable-next-line no-console
    console.log('Express started in ' + app.get('env') +' mode on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.');
});

module.exports = app;