"use strict";

//log plugin
const bunyan = require("bunyan");
//Execute a callback when a request closes, finishes, or errors
const onFinished = require('on-finished');

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
    loggerInstance['logmongohost'] = loggerInstance.fields.fields.mongoHost;
    loggerInstance['logmongodb'] = loggerInstance.fields.fields.mongoDB;
    loggerInstance['logmongocollection'] = loggerInstance.fields.fields.mongoCollection;

    return function *logger(next) {
        this.log = loggerInstance;
        yield *next;
    };
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
