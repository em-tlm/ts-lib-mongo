"use strict";

const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const config = require('./config').mongoConfig;
const logger = require('./utils/logger.js');
const uri = config.uri;

/**
 * The default connection retry is 30 (retry at once per second).
 * This is not enough, because the app will sometimes
 * lose MongoDB connection for longer than that.
 * And if that happens, it won't try to reconnect anymore, leaving the app
 * in a defunct state.
 */
// replication set configuration
let rsOptions = {
    db: {native_parser: true},
    server: {poolSize: 5, socketOptions: {connectTimeoutMS: 10000}, reconnectTries: Number.MAX_VALUE},
    replset: {rs_name: config.rs_name, socketOptions: {connectTimeoutMS: 10000}},
    user: config.user,
    pass: config.pass,
    auth: {authdb: 'admin'}
};

// single server configuration
let ssOptions = {
    server: {reconnectTries: Number.MAX_VALUE}
};

// pick the right option
let useOptions = config.rs_name;
let options = useOptions ? rsOptions : ssOptions;

/**
 * Attach event listeners
 */
mongoose.connection.on('connected', function () {
    logger.info(logger.types.MONGO_CONNECTED);
});

mongoose.connection.on('error', function (err) {
    err.type = logger.types.MONGO_ERROR;
    logger.error(err);
});

mongoose.connection.on('disconnected', function () {
    logger.info(logger.types.MONGO_DISCONNECTED);
});

/**
 * connect to mongodb
 */

function connect(){
    // http://mongoosejs.com/docs/api.html#connection_Connection-readyState
    // 0 = disconnected
    // 1 = connected
    // 2 = connecting
    // 3 = disconnecting
    const state =  mongoose.connection.readyState;

    // if there is already a connection
    // do not connect any more
    if (state == 1){
        return  Promise.resolve();
    }

    // if there is an on-going connection / disconnection
    // retry the connection after 2 seconds
    if (state == 2 || state == 3){
        return Promise.delay(2000).then(connect);
    }

    return mongoose.connect(uri, options)
        .catch(function(){
            return Promise.delay(2000).then(connect);
        });
}

module.exports.connect = connect;
module.exports.disconnect = function () {
    return mongoose.disconnect();
};