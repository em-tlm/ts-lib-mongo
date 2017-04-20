const mongoose = require('/tetrascience/tsboss/node_modules/mongoose');

var DriverSchema;
DriverSchema = new mongoose.Schema({
    driverId: String,
});

module.exports = mongoose.model('Driver', DriverSchema);
