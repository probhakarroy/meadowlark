var attraction = require('../models/attraction');

exports.attraction_get = (req, res) => {
    attraction.find({ approved : true}, (err, attractions) => {
        if(err) return res.send(500, 'Error occurred : database error.');
        res.json(attractions.map((a) => {
            return {
                name : a.name,
                id : a._id,
                description : a.description,
                location : a.location,
            }
        }));
    });
}

exports.attraction_post = (req, res) => {
    var a = new attraction({
        name : req.body.name,
        description : req.body.description,
        location : {
            lat : req.body.lat,
            lng : req.body.lng,
        },
        history : {
            event : 'created',
            email : req.body.email,
            date : new Date(),
        },
        approved : false,
    });

    a.save((err, a) => {
        if(err) return res.send(500, 'Error occured : database error.');
        res.json({id : a._id});
    });
}

exports.attraction_id_get = (req, res) => {
    attraction.findById(req.params.id, (err, a) => {
        if (err) return res.send(500, 'Error occured : database error.');
        res.json({
            name : a.name,
            id : a._id,
            description : a.description,
            location : a.location,
        });
    });
}