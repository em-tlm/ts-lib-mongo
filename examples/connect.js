const MongoDB = require('../index').MongoDB;
const DriverSchema = require('../models/Driver');
const logger = console;

const db = new MongoDB({
  host: 'localhost',
  db: 'ts',
});
const db1 = new MongoDB({
  host: 'localhost',
  db: 'ts',
});
const db2 = new MongoDB({
  uri: 'mongodb://localhost:27017/tss?connectTimeoutMS=300000',
  db: 'tss',
});


// try to connect the second time
setTimeout(()=> {
  db1.connect()
    .then((conn) => {
      console.log('another connection');
      console.log(`connection state: ${conn.readyState} (there should NOT be any extra connection logs on mongod, since connection will be reused)`);
    }).catch((e) => {
      console.error(e);
  });
}, 2000);


db.connect()
  .then((conn) => {
    conn.on('connected', function () {
      logger.log('MONGO_CONNECTED');
    });

    conn.on('error', function (err) {
      logger.error(err);
    });

    conn.on('disconnected', function () {
      logger.log('MONGO_DISCONNECTED');
    });

    conn.on('reconnected', function () {
      logger.log('MONGO_RECONNECTED');
    });

    logger.log(`connection state: ${conn.readyState}`);
    const Driver = conn.model('Driver', DriverSchema);
    const drivers = Driver.find({});
    drivers.then(function () {
      console.log('drivers found');
    }).catch(function (e) {
      console.error(e);
    });
  }, (err) => {
    console.error(err);
  });

db2.connect()
  .then((conn) => {
    console.log('can connect using connection string');
  });