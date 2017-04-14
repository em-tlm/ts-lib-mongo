# ts-lib-mongo

A client library to establish robust connection to MongoDB. 

### Reconnection 
This client will always try to reconnect to MongDB when there is error or disconnection. 
This includes the scenario when the connection fails in the initial attempt and 
when the connection fails after initial connection.

### Replication set

### Usage


```javascript
const mongoConnector = require('ts-lib-mongo').mongoConnector;
mongoConnector.connect().then(start);

function start(){
    // your code
    // which depends on mongo connection
}
```

### todo: 
* Add more unit tests