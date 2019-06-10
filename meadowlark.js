var express = require('express');
var compression = require('compression'); //Compression module
//var csurf = require('csurf'); //cross-site request forgery protection
var morgan = require('morgan'); //logger
var domain = require('express-domain-middleware'); //express domain middleware
var mongoose = require('mongoose'); //ODM
var vhost = require('vhost'); //vhost module for creating subdomain
var fs = require('fs'); //fs module
var routes = require('./routes.js'); //routes
var middlewares = require('./handlers/middlewares.js'); //middleware handlers

//cookies and session handling modules
var cookie_parser = require('cookie-parser');
var session = require('express-session');
var mongo_store = require('connect-mongo');

//local libraries
var credentials = require('./lib/credentials.js');
var weather = require('./lib/weather_data.js'); //dummy weather data


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

//handlebars 
var sections = require('express-handlebars-sections'); //creating sections
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {                                          //creating sections
        section: sections(),
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

//app.use(csurf()); //csurf middleware linked after express-session middleware

app.use(domain); //Unchaught Exception handling using Domains

//experimenting with middleware
app.use(middlewares.check_waivers);
app.use(middlewares.check_guest_counts);

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

//admin subdomain
var admin = express.Router();
app.use(vhost('admin.*', admin));

//api subdomain
var api = express.Router();
app.use(vhost('api.*', api));

//routes binding
routes(app, admin, api);

//Auto view control
var auto_views = {};
app.use((req, res, next) => {
    var path = req.path.toLowerCase();
    if(auto_views[path]) return res.render(auto_views[path]); //check cache for rendering
    // eslint-disable-next-line no-undef
    if(fs.existsSync(__dirname+'/views'+path+'.handlebars')) {
        auto_views[path] = path.replace(/^\//, '');
        return res.render(auto_views[path]);
    }
    next();
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
    console.log('Express started in ' + app.get('env') +' mode on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.');
});

module.exports = app;