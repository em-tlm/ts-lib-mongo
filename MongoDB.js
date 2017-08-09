const mongoose = require('mongoose');
const Promise = require('bluebird');
const Joi = require('joi');

const {string, number} = Joi;
mongoose.Promise = Promise;

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
      reconnectTries: Number.MAX_VALUE,
      useMongoClient: true,
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
    const existingConn = connections[this.db];
    if (existingConn) {
      state = existingConn.readyState;
    } else {
      state = 0;
    }

    // if there is already a connection
    // do not connect any more
    if (state == 1) {
      this.connection = existingConn;
      return Promise.resolve(this.connection);
    }

    // if there is an on-going connection / disconnection
    // retry the connection after 2 seconds
    if (state == 2 || state == 3) {
      return Promise.delay(this.reconnectInterval).then(this.connect.bind(this));
    }

    // this is promise
    return mongoose.createConnection(this.uri, this.options)
      .then((conn) => {
        if (!connections[this.db]) {
          connections[this.db] = conn;
          this.connection = conn;
        };
        return conn;
      })
      .catch(() => {
        return Promise.delay(this.reconnectInterval).then(this.connect.bind(this));
      });
  }

  // this will disconnect all connections
  disconnect() {
    return mongoose.disconnect();
  }
}

module.exports = Mongo;