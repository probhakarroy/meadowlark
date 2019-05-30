var express = require('express');
var fortune = require('./lib/fortune.js');

var app = express();

//handlebars
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


// eslint-disable-next-line no-undef
app.set('port', process.env.PORT || 3000);

// eslint-disable-next-line no-undef
app.use(express.static(__dirname+'/public'));

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

