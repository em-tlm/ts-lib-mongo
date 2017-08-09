const mongoose = require('mongoose');

const  DriverSchema = new mongoose.Schema({
    driverId: String,
});
module.exports = DriverSchema;
