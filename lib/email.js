//Nodemailer
var nodemailer = require('nodemailer');

module.exports = (credentials) => {
    //Nodemailer transport instance
    var mail_transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: credentials.gmail.user,
            pass: credentials.gmail.password
        }
    });

    var from = '"Meadowlark Travel" <info@meadowlarktravel.com>';
    var error_recipient = '"Maintainer" probhakarroy3110@gmail.com';

    return {
        send: function (to, subj, body) {
            mail_transport.sendMail({
                from: from,
                to: to,
                subject: subj,
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                // eslint-disable-next-line no-console
                if (err) console.error('Unable to send email: ' + err);
            });
        },
        
        email_error: function (message, filename, exception) {
            var body = '<h1>Meadowlark Travel Site Error</h1>' +
                'message:<br><pre>' + message + '</pre><br>';
            if(exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
            if(filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
            mail_transport.sendMail({
                from: from,
                to: error_recipient,
                subject: 'Meadowlark Travel Site Error',
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                // eslint-disable-next-line no-console
                if (err) console.error('Unable to send email: ' + err);
            });
        }
    }
}