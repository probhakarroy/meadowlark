var express = require('express');
var fortune = require('./lib/fortune.js');
//dummy weather data
var weather = require('./lib/weather_data.js');

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

