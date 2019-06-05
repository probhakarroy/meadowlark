var loadtest = require('loadtest');
var expect = require('chai').expect;

// eslint-disable-next-line no-undef
suite('Stress Tests', () => {
    // eslint-disable-next-line no-undef
    test('Homepage should handle 100 requests in a second', (done) => {
        var options = {
            url : 'http://localhost:3000',
            concurrency : 4,
            maxRequests : 1000
        };

        loadtest.loadTest(options, (err, result) => {
            expect(!err);
            expect(result.totalTimeSeconds < 2);
            done();
        });
    });
});