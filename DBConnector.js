"use strict";

const mongoose = require('mongoose');
const config = require('./config').mongoConfig;
const logger = require('./utils/logger.js');
const uri = config.uri;

/**
 * The default connection retry is 30 (retry at once per second).
 * This is not enough, because the app will sometimes
 * lose mongo connection for longer than that.
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
    auth: {authdb: "admin"}
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
    console.log('connected to mongo');
    logger.notice(logger.types.MONGO_CONNECTED);
});

mongoose.connection.on('error', function (err) {
    console.error(err);
    logger.error({
        message: logger.types.MONGO_ERROR,
        err: err.message,
        full_message: err.stack
    });
});

mongoose.connection.on('disconnected', function () {
    console.log('mongo disconnected');
    logger.notice(logger.types.MONGO_DISCONNECTED);
});

/**
 * connect to mongodb
 */
function mongoConnect() {

    // retry the connection if it fails
    mongoose.connect(uri, options, function (err) {
        if (err) {
            setTimeout(mongoConnect, 2000);
        }
    })
}

module.exports.mongoConnect = mongoConnect;
module.exports.mongoDisconnect = function () {
    mongoose.disconnect();
};