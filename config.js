"use strict";

const loggingConfig = {
    graylogHost: process.env.GELF_APPLICATION_HOST,
    graylogPort: process.env.GELF_APPLICATION_PORT
};

const mongoConfig = {
    uri : process.env.REPL_MONGO || 'mongodb://@localhost:27017/ts',
    rs_name : process.env.REPL_NAME,
    user : process.env.REPL_USER,
    pass : process.env.REPL_PWD
};

module.exports.loggingConfig = loggingConfig;
module.exports.mongoConfig = mongoConfig;