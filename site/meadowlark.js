var express = require('express');

//form handling modules
var formidable = require('formidable');

//cookies and session handling modules
var cookie_parser = require('cookie-parser');
var session = require('express-session');

//local libraries
var fortune = require('./lib/fortune.js');
var credentials = require('./lib/credentials.js');
var weather = require('./lib/weather_data.js'); //dummy weather data


var app = express();

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

//cookie-parser and session middlewares
app.use(cookie_parser(credentials.cookie_secret));
app.use(session({
    resave : false,
    saveUninitialized : false,
    secret : credentials.cookie_secret,
}));

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
})

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

//dummy function for newsletter signup
function newsletter_signup() {

}

newsletter_signup.prototype.save = (cb) => {
    cb();
}

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.post('/newsletter', (req, res) => {
    var name = req.body.name || '', email = req.body.email || '';
    
    //input validation
    if(!email.match(VALID_EMAIL_REGEX)){
        if(req.xhr) return res.json({error : 'Invalid email address.'});
        req.session.flash = {
            type : 'danger',
            intro : 'Validation Error!',
            message : 'The email address you entered was not valid.',
        };
        return res.redirect(303, '/newsletter/archive');
    }

    new newsletter_signup({name : name, email : email}).save((err) => {
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

app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if(err) return res.redirect(303, '/error');
        // eslint-disable-next-line no-console
        console.log('received fields : ');
        // eslint-disable-next-line no-console
        console.log(fields);
        // eslint-disable-next-line no-console
        console.log('received files : ');
        // eslint-disable-next-line no-console
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});


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
    console.log('Express started on http://localhost:' +
    app.get('port')+ '; press Ctrl-C to terminate.');
});

