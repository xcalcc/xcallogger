const WinstonLogger = require('./winston');
const utils = require('./utils');

class Logger {
    _winstonLogger = null;
    _configs = {};
    _debug = false;

    constructor(configs = {serviceName: 'service', serviceVersion: '1.0.0'}) {
        this._configs = configs;
        this.init(configs);
    }

    /**
     * init logger
     * @param configs
     */
    init(configs) {
        this._winstonLogger = new WinstonLogger({
            serviceName: configs.serviceName,
            serviceVersion: configs.serviceName,
        });
        this._winstonLogger.addTransport('console', configs.consoleConfig && configs.consoleConfig.key || 'console', configs.consoleConfig || {});

        if (configs.fileConfig) {
            this._winstonLogger.addTransport('file', configs.fileConfig && configs.fileConfig.key || 'file', configs.fileConfig);
        }

        if (configs.logstashConfig) {
            this._winstonLogger.addTransport('logstash', configs.logstashConfig && configs.logstashConfig.key || 'logstash', configs.logstashConfig || {});
        }

        if (configs.jaegerConfig) {
            const Tracer = require('./openTracing/jaeger');
            this.tracer = Tracer({
                ...configs.jaegerConfig,
                serviceName: configs.serviceName,
                serviceVersion: configs.serviceVersion,
            });
        }
    }

    /**
     * To allow or not for debug messages
     * @param verbose
     */
    setDebugMode(debug) {
        this._debug = debug;
        if (debug) {
            this._winstonLogger.setLevel('debug');
        }
    }

    /**
     * Log wrapper
     * @param level
     * @param message
     * @param meta
     * @return {*}
     */
    log(level = 'info', message, meta) {
        switch (level) {
            case 'info':
                return this._winstonLogger.singleton.log({
                    level: 'info',
                    message, meta
                });
            case 'warning':
                return this._winstonLogger.singleton.log({
                    level: 'warning',
                    message, meta
                });
            case 'error':
                return this._winstonLogger.singleton.log({
                    level: 'error',
                    message, meta
                });
            case 'fatal':
                return this._winstonLogger.singleton.log({
                    level: 'fatal',
                    message, meta
                });
        }
    }

    /**
     * info wrapper
     * @param msg
     * @param meta
     * @param printout
     */
    info(msg, meta, printout = true) {
        this._winstonLogger.info(msg, meta, printout);
    }

    /**
     * warn wrapper
     * @param msg
     * @param meta
     * @param printout
     */
    warn(msg, meta, printout = true) {
        this._winstonLogger.warn(msg, meta, printout);
    }

    /**
     * error wrapper
     * @param err
     * @param meta
     * @param printout
     */
    error(err, meta, printout = true) {
        this._winstonLogger.error(err, meta, printout);
    }

    debug(err, meta) {
        this._winstonLogger.debug(err, meta);
    }

    /**
     * fatal wrapper
     * @param err
     * @param meta
     */
    fatal(err, meta) {
        this._winstonLogger.fatal(err, meta);
    }

    /**
     *
     * @param spanName
     * @return {{addTags: (function(): {log: function()}), log: Logger.log, setTag: setTag, finish: finish, openTracing: {Tags: {}}}|*}
     */
    createTracerSpan(spanName) {
        if (!this.tracer) {
            this.info('No tracer config set');
            return {
                openTracing: {
                    Tags: {}
                },
                setTag: () => {
                },
                addTags: () => ({
                    log: () => {
                    }
                }),
                finish: () => {
                },
                log: () => {
                },
            };
        }
        const span = this.tracer.startSpan(spanName);
        span.openTracing = this.tracer.openTracing;
        return span;
    }

    /**
     * Close and flush tracer
     * @return void
     */
    flushTracer() {
        if (!this.tracer) {
            this.error('No tracer config set');
        }
        this.tracer.close();
    }

    changeLogFileLocation(transportKey, newLocation) {
        if (this._configs.hasOwnProperty('fileConfig')) {
            const newConfig = {
                ...this._configs['fileConfig'],
                dirname: newLocation,
            }
            this._winstonLogger.replaceTransport(transportKey, {
                type: 'file',
                key: transportKey,
                config: newConfig
            });
        }
    }

    /**
     * Remove a transport
     * @param transportKey
     */
    removeTransport(transportKey) {
        this._winstonLogger.removeTransport(transportKey);
    }

    /**
     *
     * @return {*}
     */
    createTraceId() {
        return utils.traceId();
    }

    /**
     * Getter for configs
     * @return {{}}
     */
    get configs() {
        return this._configs;
    }

    mute(transportKey) {
        this._winstonLogger.muteTransport(transportKey);
    }

    muteAll() {
        this._winstonLogger.muteAllTransports();
    }

    unmuteAll() {
        this._winstonLogger.unmuteAllTransports();
    }
}

module.exports = Logger;
