"use strict";

const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const _ = require('lodash');
const assert = require('assert');
const config = require('./config').mongoConfig;

const uri = config.uri;

/**
 * The default connection retry is 30 (retry at once per second).
 * This is not enough, because the app will sometimes
 * lose MongoDB connection for longer than that.
 * And if that happens, it won't try to reconnect anymore, leaving the app
 * in a defunct state.
 */
// replication set configuration
const rsOptions = {
    db: {native_parser: true},
    server: {poolSize: 5, socketOptions: {connectTimeoutMS: 10000}, reconnectTries: Number.MAX_VALUE},
    replset: {rs_name: config.rs_name, socketOptions: {connectTimeoutMS: 10000}},
    user: config.user,
    pass: config.pass,
    auth: {authdb: 'admin'}
};

// single server configuration
const ssOptions = {
    server: {reconnectTries: Number.MAX_VALUE}
};

// pick the right option
const useOptions = config.rs_name;
const options = useOptions ? rsOptions : ssOptions;


class Mongo{
    constructor(config) {
        assert(_.isUndefined(config) || _.isObject(config), `must pass in an object as argument`);
        this.options = config || options;
        this.connection = mongoose.connection;
    }

    connect(){
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
            return Promise.delay(2000).then(this.connect.bind(this));
        }

        return mongoose.connect(uri, options)
            .catch(()=>{
                return Promise.delay(2000).then(this.connect.bind(this));
            });
    }

    disconnect(){
        return mongoose.disconnect();
    }
}

module.exports = Mongo;