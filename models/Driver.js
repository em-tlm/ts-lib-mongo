var mongoose = require('mongoose');

var DriverSchema;
DriverSchema = new mongoose.Schema({
    driverId: String,
});

module.exports = mongoose.model('Driver', DriverSchema);
