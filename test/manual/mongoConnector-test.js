"use strict";
const mongoConnector = require('../../index.js').mongoConnector;
require('../../models/Driver.js');
const mongoose = require('mongoose');
const Driver = mongoose.model('Driver');

// try to connect the second time
setTimeout(function () {
    console.log('another connection');
    console.log(`connection state: ${mongoose.connection.readyState}`);
    mongoConnector.connect();
}, 2000);


mongoConnector.connect()
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