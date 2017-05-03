"use strict";

const mongoConfig = {
    uri : process.env.REPL_MONGO || 'mongodb://@localhost:27017/ts',
    rs_name : process.env.REPL_NAME,
    user : process.env.REPL_USER,
    pass : process.env.REPL_PWD
};

module.exports.mongoConfig = mongoConfig;