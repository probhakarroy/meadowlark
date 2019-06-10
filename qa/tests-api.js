/* eslint-disable no-undef */
var assert = require('chai').assert;
var rest = require('restler');

suite('API tests', () => {
    var attraction = {
        lat : 45.516011,
        lng : -122.682062,
        name : 'Portland Art Museum',
        description: 'Founded in 1892, the Portland Art Museum\'s colleciton ' +
            'of native art is not to be missed. If modern art is more to your ' +
            'liking, there are six stories of modern art for your enjoyment.',
        email : 'test@meadowlarktravel.com',
    };

    var base = 'http://api.localhost:3000';

    test('should be able to add an attraction', (done) => {
        rest.post(base+'/attraction', {data : attraction}).on('success', (data) => {
            assert.match(data.id, /\w/, 'id must be set');
            done();
        });
    });

    test('should be able to retrive an attraction', (done) => {
        rest.post(base+'/attraction', {data : attraction}).on('success', (data) => {
            rest.get(base+'/attraction/'+data.id).on('success', (data) => {
                assert(data.name === attraction.name);
                assert(data.description === attraction.description);
                done();
            });
        });
    });
});