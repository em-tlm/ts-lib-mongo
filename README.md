# ts-lib-mongo

A client library to establish robust connection to MongoDB. 

### Reconnection 
This client will always try to reconnect to MongDB when there is error or disconnection. 
This includes the scenarios 
* when the connection fails in the initial attempt 
* when the connection fails after initial connection



### Usage
* Example usage of this library can be found at [ts-lib-mongo-example](https://github.com/tetrascience/ts-lib-mongo-example). 
* Use library's default connection config. No need to pass anything to the constructor. 
*This is the most common usage*, since the relevant MongoDB information should have been added to the container
in the form of environmental variables. 
```javascript
const Mongo = require('ts-lib-mongo').Mongo;
const db = new Mongo();
db.connect().then(start);

// a function that depends on mongo connection
function start(){}
```
The library uses the environmental variable as the config:
```javascript
const config = {
   uri : process.env.REPL_MONGO || 'mongodb://@localhost:27017/ts',
   rs_name : process.env.REPL_NAME,
   user : process.env.REPL_USER,
   pass : process.env.REPL_PWD
};
```

* Pass in the connection configuration, this will overwrite the default config. 
This library currently support the following 4 options in the configuration: 
  * uri
  * rs_name
  * user
  * pass  
  
To understand what those configuration options mean, refer to [mongoose documention](http://mongoosejs.com/docs/connections.html). 

  * To connect to one single MongoDB server
    ```javascript
    const config = {
       uri : 'mongodb://@localhost:27017/ts'
    };
    const Mongo = require('ts-lib-mongo').Mongo;
    const db = new Mongo(config);
    db.connect().then(start);
    
    function start(){}
    ```

  * To connect to a MongoDB replication set 
    ```javascript
    const config = {
       uri : 'mongodb://@localhost:27017/ts',
       rs_name : 'mongodb://mongodb-mongo-cluster-1,mongodb-mongo-cluster-2,mongodb-mongo-cluster-3:27017/ts',
       user : 'username',
       pass : 'password'
    };
    const Mongo = require('ts-lib-mongo').Mongo;
    const db = new Mongo(config);
    db.connect().then(start);
    
    function start(){}
    ```

### Events
You can attach event listener to the MongoDB connection. 
For a full list of events, refer to [mongoose documentation](http://mongoosejs.com/docs/api.html#connection_Connection). 
```javascript
const Mongo = require('ts-lib-mongo').Mongo;
const db = new Mongo();
db.connect();
db.connection.on('error', (e) => { console.error(e); });
```


### todo: 
* Add more unit tests
* Add more instruction on how to use the 