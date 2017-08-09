# ts-lib-mongo

A client library that is able to establish multiple robust connections to MongoDB. 

## Key features
### Reconnection 
This client will always try to reconnect to MongDB when there is error or disconnection. 
This includes the scenarios:
* when the connection fails in the initial attempt. (By default, `reconnectInterval` is 2000ms) 
* when the connection fails after initial connection. (`reconnectTries` is set to `Number.MAX_VALUE`)
### Mutliple connection
By default [mongoose](http://mongoosejs.com/) use a shared connection object (`mongoose.connection`) and this 
creates trouble when your application needs to interface with multiple different MongoDB databases. 

This implementation uses `mongoose.createConnection` instead such that your code can use multiple MongoDB databases 
simultaneously. If you pass in the same `db`, then this implementation will reuse an existing connection is there is 
any available. 

## Usage 

```javascript
const MongoDB = require('ts-lib-mongo').MongoDB;

const DriverSchema = new mongoose.Schema({
   driverId: String,
});

const db = new MongoDB({
  uri: 'mongodb://localhost:27017/app',
  db: 'app',
});
const db1 = new MongoDB({
  uri: 'mongodb://localhost:27017/app1',
  db: 'app1',
});

// db1 and db will not share 
db.connect().then((conn)=> {
    const Driver = conn.model('Driver', DriverSchema);
    const drivers = Driver.find({});
});
db1.connect().then((conn)=> {
    const Driver = conn.model('Driver', DriverSchema);
    const drivers = Driver.find({});
});

// a function that depends on mongo connection
function start(){}
```

If you would like to connect to a replication set, just use a different `uri` or `host`. For example:
```javascript
const config = {
    uri: 'mongodb://mongodb-mongo-cluster-1,mongodb-mongo-cluster-2,mongodb-mongo-cluster-3:27017/ts',
    db: 'ts',
};
const MongoDB = require('ts-lib-mongo').MongoDB;
const db = new MongoDB(config);
db.connect().then(start);

const config1 = {
    host: 'mongodb-mongo-cluster-1,mongodb-mongo-cluster-2,mongodb-mongo-cluster-3',
    db: 'ts',
};
const db1 = new MongoDB(config);
db1.connect().then(start);

function start(){}
```

## API

```js
const MongoDB = require('ts-lib-mongo').MongoDB;
const mongoDB = new MongoDB({
  uri: 'mongodb://username:password@host:port/database?options...',
  db: 'database',
});
```

### `new MongoDB(options)`
__Parameters__

* `options`: _(optional)_ an object with the following keys:

  + `uri`: _(optional)_ URI to use for the connection. Required if `host` is missing.

  + `host`: _(optional)_ Hostname of the MongoDB server. Required if `uri` is missing.
  
  + `db`: The MongoDB database to connect to.
  
  + `username`: _(optional)_ Username to use to connect the particular database in MongoDB.

  + `password`: _(optional)_ Password to use to connect the particular database in MongoDB.

  + `port`: _(optional)_ Port of the MongoDB server `default: 27017`.
  
  + `reconnectInterval`: _(optional)_ Time interval to retry MongoDB connection `default: 2000`.


### Events
You can attach event listener to the MongoDB connection. 
For a full list of events, refer to [mongoose documentation](http://mongoosejs.com/docs/api.html#connection_Connection). 
```javascript
const MongoDB = require('ts-lib-mongo').MongoDB;
const db = new MongoDB({
  uri: 'mongodb://localhost/myapp',
  db: 'app',
});
db.connect().then((conn)=> {
  db.connection.on('error', (e) => { console.error(e); });    
});
```

### Peer Dependency
`mongoose` is added as a [peer dependency](https://nodejs.org/en/blog/npm/peer-dependencies/) in package.json. 
This allows the application that uses this library to access the same mongoose object used in this library. 

### todo: 
* Add more unit tests (question how to start and stop mongod?)
