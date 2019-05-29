var express = require('express');
var fortune = require('./lib/fortune.js');

var app = express();

//handlebars
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname+'/public'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about', {fortune : fortune.get_fortune()});
});

//Custom 404 Page
app.use((req, res) => {
    res.status(404);
    res.render('404');
});

//Custom 500 page
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500);
   res.render('500'); 
});

app.listen(app.get('port'), () => {
    console.log('Express started on http://localhost:' +
    app.get('port')+ '; press Ctrl-C to terminate.');
});

