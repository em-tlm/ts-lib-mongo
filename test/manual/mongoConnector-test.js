"use strict";

const Mongo = require('../../index.js').Mongo;
require('../../models/Driver.js');
//const mongoose = require('mongoose');
const mongoose = require('/tetrascience/tsboss/node_modules/mongoose');
const Driver = mongoose.model('Driver');
const logger = require('../../utils/logger.js');

const db = new Mongo();
const db1 = new Mongo();

db.connection.on('connected', function () {
    logger.info(logger.types.MONGO_CONNECTED);
});

db.connection.on('error', function (err) {
    err.type = logger.types.MONGO_ERROR;
    logger.error(err);
});

db.connection.on('disconnected', function () {
    logger.info(logger.types.MONGO_DISCONNECTED);
});

// try to connect the second time
setTimeout(function () {
    console.log('another connection');
    console.log(`connection state: ${mongoose.connection.readyState}`);
    console.log(`there should NOT be any extra connection logs on mongod`);
    db1.connect().catch((e) =>{
        console.error(e);
    });
}, 20000);


db.connect()
    .then(function () {
        console.log(`connection state: ${mongoose.connection.readyState}`);
        const drivers = Driver.find({});
        drivers.then(function () {
            console.log('drivers found');
        }).catch(function (e) {
            console.error(e);
        });
    }, function (e) {
        console.error(e);
    });