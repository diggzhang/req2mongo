"use strict";

//log plugin
const bunyan = require("bunyan");
//Execute a callback when a request closes, finishes, or errors
const onFinished = require('on-finished');
const MongoClient = require('mongodb').MongoClient;


function createOrUseLogger(logger) {
    if (!logger || logger.info || !logger.child) {
        let loggerOpts = logger || {};
        loggerOpts.name = loggerOpts.name || 'defaultLog';
        logger = bunyan.createLogger(loggerOpts);
    };

    return logger;
};


/*
 * Koa middleware layer, adds this.log property to koa context
 * and this contain mongodb config
 *
 * Parameters:
 *      - loggerInstance Ref:[node-bunyan#Constructor API](https://github.com/trentm/node-bunyan)
 *
 * How to require:
 * const koaBunyanLogger = require('log2mongo');
 * const appLoggerTag = bunyan.createLogger({name:'onionsLog', mongoHost:'10.8.8.111', mongoDB:'testLog', mongoCollection:'logs'})
 * app.use(koaBunyanLogger(appLoggerTag))
 */

module.exports = function (loggerInstance) {

    loggerInstance = createOrUseLogger(loggerInstance);

    /*
     * Add mongo config into this instance
     * Default mongodb://localhost:27017/applog collection: logs
     */
    loggerInstance['logmongohost'] = loggerInstance.fields.fields.mongoHost || "localhost";
    loggerInstance['logmongoport'] = loggerInstance.fields.fields.mongoPort || "27017";
    loggerInstance['logmongodb'] = loggerInstance.fields.fields.mongoDB || "applog";
    loggerInstance['logmongocollection'] = loggerInstance.fields.fields.mongoCollection || "logs";
    loggerInstance['logmongolink'] = "mongodb://" +
        loggerInstance['logmongohost'] + ":" +
        loggerInstance['logmongoport'] + "/" +
        loggerInstance['logmongodb'];

    return function *logger(next) {
        this.log = loggerInstance;
        yield *next;
    };
};

function saveToMongo(config, msg) {
    MongoClient.connect(config.logmongolink, function (err, db) {
        if (err) throw err;
        let collection = db.collection(config.logmongocollection);
        collection.insert(msg, function (err, docs) {
            if (err) throw err;
            db.close();
        });
    });
};

module.exports.logSniffer = function () {

    return function *logSniffer(next) {
        let err;

        let onResponseFinished = function () {
            let logMsg = {
                url: this.request.originalUrl,
                request: this.request.body,
                response: this.response.body,
                method: this.request.method,
                status: this.status,
            };
            console.log(logMsg);
            saveToMongo(this.log, logMsg);
        };

        try {
            yield *next;
        } catch(e) {
            err = e;
        }finally {
            onFinished(this.response.res, onResponseFinished.bind(this));
        };

        if (err) {
            throw new err;
        };
    };
};
