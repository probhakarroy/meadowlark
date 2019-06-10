// experimenting with req and res headers
exports.headers = (req, res) => {
    res.type('text/plain');
    var s = '';
    for (var name in req.headers) {
        s += name + ' : ' + req.headers[name] + '\n';
    }
    res.send(s);
}

exports.greetings = (req, res) => {
    res.render('about', {
        message: 'welcome',
        query: req.query,
        cookie: req.cookie,
        signed_cookie: req.signedCookies,
        session: req.session
    });
}

exports.no_layout = (req, res) => {
    res.render('no-layout', { layout: null });
}

exports.jquery_test = (req, res) => {
    res.render('jquery-test');
}

exports.nursery_rhyme = (req, res) => {
    res.render('nursery-rhyme');
}

exports.data_nursery_rhyme = (req, res) => {
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
}

//Handling Uncaught Exceptions
// eslint-disable-next-line no-unused-vars
exports.epic_fail = (req, res) => {
    setTimeout(() => {
        throw new Error('Nope!');
    }, 0);
}