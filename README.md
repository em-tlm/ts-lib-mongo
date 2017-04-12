# ts-lib-mongo

A client library to establish robust connection to MongoDB. 


This is a proposed API interface, would love your feedback. 
All the functions will return promise. 

```javascript
const config = {}; 
const conn = require('ts-lib-mongo')(config).mongoConnector;
conn.mongoConnect().then(start);

function start(){
    // your code
    // which depends on mongo connection
}
```