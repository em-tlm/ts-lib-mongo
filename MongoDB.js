const mongoose = require('mongoose');
const Promise = require('bluebird');
const Joi = require('joi');

const {string, number, any, func } = Joi;
mongoose.Promise = Promise;

const optionSchema = Joi.object().keys({
  db: string().required(),
  uri: string().uri({
    scheme: [
      'mongodb'
    ]
  }),
  host: string(),
  replicationSet: string().when('host', {
      is: string().required().regex(/(.*)\,(.*)\,(.*)/),
      then: string().required(),
      otherwise: any().strip(),
    }
  ),
  username: string(),
  password: string().when('username', {
    is: string().required(),
    then: string().required(),
  }),
  port: number().default(27017),
  reconnectInterval: number().min(100).default(2000),
  onConnectionError: func(),
}).options({
  stripUnknown: true
}).or('uri', 'host').required();

const connections = {};

class Mongo {
  constructor(config) {
    config = Joi.attempt(config, optionSchema);
    this.options = {
      reconnectTries: Number.MAX_VALUE,
      connectTimeoutMS: 10000,
      keepAlive: true,
      tlsInsecure: true
    };
    if (config.replicationSet) {
      this.options.replicaSet = config.replicationSet;
    }
    this.host = config.host;
    this.port = config.port;
    this.db = config.db;
    this.username = config.username;
    this.password = config.password;



    // if there is a uri passed in, use that.
    // assume the user has passed in all the options as query parameters in the uri
    if (config.uri) {
      this.uri = config.uri;
      this.options = {};
    } else {
      let baseUrl = `${this.host}:${this.port}/${this.db}`;
      if (this.username && this.password) {
        this.uri = `mongodb://${this.username}:${this.password}@${baseUrl}`;
      } else {
        this.uri = `mongodb://${baseUrl}`;
      }
    }

    this.reconnectInterval = config.reconnectInterval;
    this.onConnectionError = config.onConnectionError || (function() {});
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

    return Promise.resolve()
      .then(() => mongoose.createConnection(this.uri, this.options))
      .then((conn) => {
        if (!connections[this.db]) {
          connections[this.db] = conn;
          this.connection = conn;
        }
        return conn;
      })
      .catch((e) => {
        this.onConnectionError(e);
        return Promise.delay(this.reconnectInterval).then(this.connect.bind(this));
      });
  }

  // this will disconnect all connections
  disconnect() {
    return mongoose.disconnect();
  }
}

module.exports = Mongo;
