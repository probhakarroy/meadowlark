/* eslint-disable no-undef */
var fortune = require('../lib/fortune.js');
var expect = require('chai').expect;

suite('Fortune cookie tests', () => {
    test('get_fortune() should return a fortune', (done) => {
        expect(typeof fortune.get_fortune() === 'string');
    done();
    });
});

