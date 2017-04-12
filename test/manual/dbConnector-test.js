
"use strict";
var dbConnector = require('../../DBConnector.js');
dbConnector.mongoConnect();
require('../../models/Driver.js');
var mongoose = require('mongoose');
var Driver = mongoose.model('Driver');
var drivers = Driver.find({});
drivers.then(function(){
    console.log('here');
    console.log('here');
}).catch(function(e){
    console.error(e);
});

setTimeout(function(){
    console.log('another connection');
    dbConnector.mongoConnect();
}, 5000);
