'use strict';
const config = require('./../config').loggingConfig;
const types = {
    MONGO_CONNECTED: 'mongo-connected',
    MONGO_ERROR: 'mongo-error',
    MONGO_DISCONNECTED: 'mongo-disconnected'
};


let transport;

if (config.graylogHost && config.graylogPort) {
    transport = 'graylog';
} else {
    transport = 'console';
}

const logger = require('ts-lib-logger')(transport, config);
logger.extendTypes(types);

module.exports = logger;

