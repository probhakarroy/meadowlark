//handler modules
var app_main = require('./handlers/app_main.js');
var admin_main = require('./handlers/admin_main.js');
var vacations = require('./handlers/vacations.js');
var experiment = require('./handlers/experiment.js');
var api_handler = require('./handlers/api.js');

module.exports = (app, admin, api) => {
    //app routes
    app.get('/', app_main.home);
    app.get('/about', app_main.about);
    app.get('/newsletter', app_main.newsletter_get); //form handling
    app.post('/newsletter', app_main.newsletter_post); //form handling //experimentin with express-session
    app.get('/set-currency/:currency', app_main.set_currency);
    app.get('/notify-me-when-in-season', app_main.notify_me_when_in_season_get); //push data in Db
    app.post('/notify-me-when-in-season', app_main.notify_me_when_in_season_post); //push data in Db


    //vacations routes
    app.get('/tours/hood-river', vacations.tours_hood_river); //for integration testing
    app.get('/tours/oregon-coast', vacations.tours_oregon_coast); //for integration testing
    app.get('/tours/request-group-rate', vacations.tours_request_group_rate); //for integration testing
    app.get('/contest/vacation-photo', vacations.contest_vacation_photo_get); //form handling file upload
    app.post('/contest/vacation-photo/:year/:month', vacations.contest_vacation_photo_post); //form handling file upload with formidable
    app.post('/cart/checkout', vacations.cart_checkout_post);//handling of cart-checkout using email.
    app.get('/vacations', vacations.vacations);


    // experimenting with req and res headers
    app.get('/headers', experiment.headers);
    app.get('/greetings', experiment.greetings);
    app.get('/no-layout', experiment.no_layout);
    app.get('/jquery-test', experiment.jquery_test);
    app.get('/nursery-rhyme', experiment.nursery_rhyme);
    app.get('/data/nursery-rhyme', experiment.data_nursery_rhyme);
    app.get('/epic-fail', experiment.epic_fail); //Handling Uncaught Exceptions


    //admin routes
    admin.get('/', admin_main.home);
    admin.get('/users', admin_main.users);


    //api routes
    api.get('/attraction', api_handler.attraction_get);
    api.post('/attraction', api_handler.attraction_post);
    api.get('/attraction/:id', api_handler.attraction_id_get);
}