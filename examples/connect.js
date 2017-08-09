"use strict";

const MongoDB = require('../index').MongoDB;
const DriverSchema = require('../models/Driver');
const logger = console;

const db = new MongoDB({
  uri: 'mongodb://localhost:27017/ts',
  db: 'ts',
});
const db1 = new MongoDB({
  uri: 'mongodb://localhost:27017/ts',
  db: 'ts',
});


// try to connect the second time
setTimeout(function () {

  db1.connect()
    .then((conn) => {
      console.log('another connection');
      console.log(`connection state: ${conn.readyState} (there should NOT be any extra connection logs on mongod, since connection will be reused)`);
    }).catch((e) => {
      console.error(e);
  });
}, 5000);


db.connect()
  .then(function (conn) {
    conn.on('connected', function () {
      logger.log('MONGO_CONNECTED');
    });

    conn.on('error', function (err) {
      logger.error(err);
    });

    conn.on('disconnected', function () {
      logger.log('MONGO_DISCONNECTED');
    });

    conn.on('reconnected', function () {
      logger.log('MONGO_RECONNECTED');
    });

    logger.log(`connection state: ${conn.readyState}`);
    const Driver = conn.model('Driver', DriverSchema);
    const drivers = Driver.find({});
    drivers.then(function () {
      console.log('drivers found');
    }).catch(function (e) {
      console.error(e);
    });
  }, function (e) {
    console.error(e);
  });
