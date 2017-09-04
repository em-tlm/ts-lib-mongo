# ts-lib-mongo

A client library that is able to establish multiple robust connections to multiple MongoDB databases. 

* [key features](#key-features)
  * [reconnection](#reconnection)
  * [multiple connection](#multiple-connection)
* [usage](#usage)
  * [single node connection](#single-node-connection)
  * [replication set](#replication-set)
  * [connection string](#connection-string)
* [api](#api)
  * [ `new MongoDB(options)` ](#new-mongodboptions)
  * [ `mongoDB.connect()` ](#mongodb-connect)
  * [ `events` ](#events)

## Key features

### Reconnection 
This client will always try to reconnect to MongDB when there is error or disconnection. 
This includes the scenarios:
* when the connection fails in the initial attempt. 
(By default, `reconnectInterval` is 2000ms and this is handled by this library) 
* when the connection fails after initial connection. 
(`reconnectTries` is set to `Number.MAX_VALUE` and this is handled by the mongoose)

### Mutliple connection
By default [mongoose](http://mongoosejs.com/) use a shared connection object (`mongoose.connection`) and this 
creates trouble when your application needs to interface with multiple different MongoDB databases. 

This implementation uses `mongoose.createConnection` instead such that your code can use multiple MongoDB databases 
simultaneously. If you pass in the same `db`, then this implementation will reuse an existing connection if there is 
any available. 

## Usage 

> For more examples, refer to [examples](examples/connect.js).

### Single node connection
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

// db1 and db will not share the same connection
// they are two different databases
db.connect().then((conn)=> {
    const Driver = conn.model('Driver', DriverSchema);
    const drivers = Driver.find({});
});
db1.connect().then((conn)=> {
    const Driver = conn.model('Driver', DriverSchema);
    const drivers = Driver.find({});
});

```

### Replication set
If you would like to connect to a replication set, just use a different `host` and 
add the `replicationSet` for the replication set's name. For example:
```javascript
const config = {
    host: 'mongodb-mongo-cluster-1,mongodb-mongo-cluster-2,mongodb-mongo-cluster-3',
    db: 'ts',
    replicationSet: 'ts',
};
const db = new MongoDB(config);
db.connect().then(start);

// a function that depends on MongoDB connection
function start(){}
```

### Connection string 
You can also use an arbitrary [connection string](https://docs.mongodb.com/manual/reference/connection-string/).
Be aware that the code does NOT validate or check connection string.

```javascript
const config = {
    uri: 'mongodb://mongodb-mongo-cluster-1,mongodb-mongo-cluster-2,mongodb-mongo-cluster-3:27017/ts?replicaSet=ts&connectTimeoutMS=300000',
    db: 'ts',
};
const MongoDB = require('ts-lib-mongo').MongoDB;
const db = new MongoDB(config);
db.connect().then(start);

// a function that depends on MongoDB connection
function start(){}
```
> Make sure you use the same database in both `uri` and `db`, in this case they are both `ts`. 
Currently the code does NOT check the consistency. 


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

* `options`: an object with the following keys:

  + `uri`: _(optional)_ URI to use for the connection. Required if `host` is missing. Read more about 
  [connection string](https://docs.mongodb.com/manual/reference/connection-string/).

  + `host`: _(optional)_ Hostname of the MongoDB server. Required if `uri` is missing.
  
  + `db`: The MongoDB database to connect to.
  
  + `replicationSet`: _(optional)_ The replication set name.
  
  + `username`: _(optional)_ Username to use to connect the particular database in MongoDB.

  + `password`: _(optional)_ Password to use to connect the particular database in MongoDB.

  + `port`: _(optional)_ Port of the MongoDB server `default: 27017`.
  
  + `reconnectInterval`: _(optional)_ Time interval to retry MongoDB connection `default: 2000`.

### `mongoDB.connect()`
This will return a promise of the connection object. You can then attach event listeners 
to the connection object. 

### Events
You can attach event listener to the connection object returned by the `connect()`. 
For a full list of events, refer to [mongoose documentation](http://mongoosejs.com/docs/api.html#connection_Connection). 


## Peer Dependency
`mongoose` is added as a [peer dependency](https://nodejs.org/en/blog/npm/peer-dependencies/) in package.json. 
This allows the application that uses this library to access the same mongoose object used in this library. 

### todo: 
* Add more unit tests (question how to start and stop mongod?)
