# ts-lib-mongo

A client library to establish robust connection to MongoDB. 

### Reconnection 
This client will always try to reconnect to MongDB when there is error or disconnection. 
This includes the scenario when the connection fails in the initial attempt and 
when the connection fails after initial connection.

### Replication set

### Usage
This is a proposed API interface, would love your feedback. 


```javascript
const config = {}; 
const conn = require('ts-lib-mongo')(config).mongoConnector;
conn.mongoConnect().then(start);

function start(){
    // your code
    // which depends on mongo connection
}
```

### todo:
* All the functions will return promise.
* Use bluebird as the mongoose promise lib. 
* Add more unit tests