"use strict";

const mongoose = require('mongoose');
const Promise = require('bluebird');
const _ = require('lodash');
const assert = require('assert');
const config = require('./config').mongoConfig;
const Joi = require('joi');

const {string, object, number} = Joi;
const defaultUri = config.uri;
mongoose.Promise = Promise;
// The default connection retry is 30 (retry at once per second).
// This is not enough, because the app will sometimes
// lose MongoDB connection for longer than that.
// If that happens, it won't try to reconnect anymore, leaving the app
// in a defunct state. Thus use Number.MAX_VALUE as reconnectTries
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
const useRsOptions = config.rs_name;
const defaultOptions = useRsOptions ? rsOptions : ssOptions;

// construct the default config
const defaultConfig = {
  uri: defaultUri,
  options: defaultOptions,
  reconnectInterval: 2000
};

const optionSchema = Joi.object().keys({
  db: string().required(),
  uri: string().required(),
  user: string(),
  pass: string(),
  reconnectInterval: number().min(100).default(2000),
}).options({
  stripUnknown: true
}).required();

const connections = {};

class Mongo {
  constructor(config) {
    config = Joi.attempt(config, optionSchema);
    this.options = {
      db: {
        native_parser: true
      },
      server: {
        poolSize: 5,
        socketOptions: {
          connectTimeoutMS: 10000
        },
        reconnectTries: Number.MAX_VALUE
      },
      replset: {
        socketOptions: {
          connectTimeoutMS: 10000
        }
      },
      user: config.user,
      pass: config.pass,
      auth: {
        authdb: 'admin'
      }
    };
    this.uri = config.uri;
    this.db = config.db;
    this.reconnectInterval = config.reconnectInterval;
  }

  connect() {
    // http://mongoosejs.com/docs/api.html#connection_Connection-readyState
    // 0 = disconnected
    // 1 = connected
    // 2 = connecting
    // 3 = disconnecting
    let state;
    if (connections[this.db]) {
      state = connections[this.db].readyState;
    } else {
      state = 0;
    }

    // if there is already a connection
    // do not connect any more
    if (state == 1) {
      return Promise.resolve();
    }

    // if there is an on-going connection / disconnection
    // retry the connection after 2 seconds
    if (state == 2 || state == 3) {
      return Promise.delay(this.reconnectInterval).then(this.connect.bind(this));
    }

    const conn = mongoose.createConnection(this.uri, this.options)
      .catch(() => {
        return Promise.delay(this.reconnectInterval).then(this.connect.bind(this));
      });

    if (!connections[this.db]) {
      connections[this.db] = conn;
    }

    return conn;
  }

  disconnect() {
    return mongoose.disconnect();
  }
}

module.exports = Mongo;