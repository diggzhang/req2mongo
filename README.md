req2mongo
===============

Koa.js middleware. Sniffer request/response as json save to mongodb

Credits and inspired by:

* [KoaJS](https://github.com/koajs)
* [node-bunyan](https://github.com/trentm/node-bunyan)
* [koa-bunyan](https://github.com/ivpusic/koa-bunyan)
* [koa-json-logger](https://github.com/rudijs/koa-json-logger)


## Not ready to use 

Code review, suggestions and pull requests very much welcome - thanks!

## Install 

`npm install --save req2mongo`

## Usage 

My code is really simple and easy to use, `index.js` is best readme file.


```javascript
const req2mongo = require('req2mongo')
const appLoggerTag = {name:'newLog', mongoHost:'10.8.8.111', mongoDB:'testLog', mongoPort:27017, mongoCollection:'logs'}

...

app
    ...
    .use(req2mongo(appLoggerTag))   // mongo configure
    .use(req2mongo.logSniffer())    // sniffer any req/res save to mongo
    ...
    
```

## Todo

[] test case

## Bug

```
connection error: { [Error: Trying to open unclosed connection.] state: 1 }

```
