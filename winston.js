const winston = require('winston');
const fs = require('fs-extra');
const path = require('path');
const Enums = require('./enums');
const elasticsearchTransport = require('./transports/elasticsearch');
const logstashTransport = require('./transports/logstash');
const fileTransport = require('./transports/file');
const consoleTransport = require('./transports/console');
const outputFormats = require('./outputFormats');

/**
 * Logger class
 * Output format: ['xc5', 'plain', 'timelyPlain']
 */
class WinstonLogger {
    _transports = {};
    _outputFormats = {};
    _logger = null;
    _serviceName = '';
    _serviceVersion = '';

    constructor(config) {
        this._serviceName = config.serviceName;
        this._serviceVersion = config.serviceVersion;
        this._outputFormats = {
            xc5: outputFormats.xc5(this._serviceName, this._serviceVersion),
            plain: outputFormats.plain(),
            timelyPlain: outputFormats.timelyPlain(),
        }

        winston.addColors(Enums.levelColors);
        this._init();
    }

    /**
     * create console transport
     * @param config
     * @return {consoleTransport}
     * @private
     */
    _createConsoleTransport(config) {
        const format = (config && config.format) ? this._outputFormats[config.format] : this._outputFormats['xc5'];
        const consoleConfig = {
            ...config,
            /**
             * Font styles: bold, dim, italic, underline, inverse, hidden, strikethrough.
             * Font foreground colors: black, red, green, yellow, blue, magenta, cyan, white, gray, grey.
             * Background colors: blackBG, redBG, greenBG, yellowBG, blueBG magentaBG, cyanBG, whiteBG
             */
            format: winston.format.combine(
                format,
                winston.format.colorize({
                    all: true
                }),
            ),
        };
        return consoleTransport(consoleConfig);
    }

    /**
     * create file transport
     * @param config
     * @return {fileTransport}
     * @private
     */
    _createFileTransport(config) {
        const format = (config && config.format) ? this._outputFormats[config.format] : this._outputFormats['plain'];
        return fileTransport({
            ...config,
            format,
        });
    }

    /**
     * create elasticsearch transport
     * @param config
     * @return {elasticsearchTransport}
     * @private
     */
    _createElasticsearchTransport(config) {
        const format = (config && config.format) ? this._outputFormats[config.format] : this._outputFormats['xc5'];
        return elasticsearchTransport({
            ...config,
            format
        });
    }

    /**
     * create logstash transport
     * @param config
     * @return {logstashTransport}
     * @private
     */
    _createLogstashTransport(config) {
        const format = (config && config.format) ? this._outputFormats[config.format] : this._outputFormats['xc5'];
        return logstashTransport({
            ...config,
            format
        });
    }

    /**
     * add transport to class
     * @param type
     * @param key
     * @param config
     */
    addTransport(type, key, config) {
        try {
            switch (type) {
                case 'file':
                    const logPath = config.dirname ? path.resolve(config.dirname) : path.resolve(__dirname, './logs');
                    fs.ensureDirSync(logPath);
                    this._transports[key] = this._createFileTransport(config);
                    break;
                case 'elasticsearch':
                    this._transports[key] = this._createElasticsearchTransport(config);
                    break;
                case 'logstash':
                    this._transports[key] = this._createLogstashTransport(config);
                    break;
                case 'console':
                default:
                    this._transports[key] = this._createConsoleTransport(config);
                    break;
            }
            this._logger.add(this._transports[key]);
        } catch (e) {
            this._logger.fatal(`Add log transport error, ${e}`);
        }
    }

    _init() {
        this._logger = winston.createLogger({
            levels: Enums.levels,
            // transports: Object.keys(this._transports).map(transport => this._transports[transport]),
        });

        this._logger.on('error', (error) => {
            console.error('Error caught', error);
        });
    }

    /**
     * singleton
     * @return winston
     */
    get singleton() {
        return this._logger;
    }

    /**
     * Wrapper for winston info msg
     * @param msg
     * @param meta
     * @param printout
     */
    info(msg, meta, printout = true) {
        if (printout) {
            this._logger.log('info', msg, meta);
        } else {
            this._logger.remove(this._transports['console']);
            this._logger.log('info', msg, meta);
            this._logger.add(this._transports['console']);
        }
    }

    /**
     * Wrapper for winston warn msg
     * @param msg
     * @param meta
     * @param printout
     */
    warn(msg, meta, printout = true) {
        if (printout) {
            this._logger.log('warning', msg, meta);
        } else {
            this._logger.remove(this._transports['console']);
            this._logger.log('warning', msg, meta);
            this._logger.add(this._transports['console']);
        }
    }

    /**
     * Wrapper for winston error msg
     * @param msg
     * @param meta
     * @param printout
     */
    error(msg, meta, printout = true) {
        if (printout) {
            this._logger.log('error', msg, meta);
        } else {
            this._logger.remove(this._transports['console']);
            this._logger.log('error', msg, meta);
            this._logger.add(this._transports['console']);
        }
    }

    /**
     * Wrapper for fatal msg, always print out
     * @param msg
     * @param meta
     */
    fatal(msg, meta) {
        this._logger.log('fatal', msg, meta);
    }

    /**
     * Debug
     * @param msg
     * @param meta
     */
    debug(msg, meta) {
        this._logger.log('debug', msg, meta);
    }


    /**
     * Set level for each
     * @param level
     */
    setLevel(level, transportKey) {
        if (transportKey) {
            this._transports[transportKey] = level;
        } else {
            Object.keys(this._transports).forEach(transport => {
                this._transports[transport].level = level;
            });
        }
    }

    /**
     * To replace a transport
     * @param toReplacedTransportKey
     * @param type
     * @param key
     * @param config
     * @return {boolean}
     */
    replaceTransport(toReplacedTransportKey, {type, key, config}) {
        if (this.removeTransport(toReplacedTransportKey)) {
            this.addTransport(type, key, config);
            return true;
        }
        return false;
    }

    removeTransport(transportKey) {
        if (this._transports.hasOwnProperty(transportKey)) {
            this._logger.remove(this._transports[transportKey]);
            return true;
        }
        return false;
    }

    /**
     * Mute a particular transport by transport key
     * @param transportKey
     */
    muteTransport(transportKey) {
        this._transports[transportKey].silent = true;
    }

    /**
     * Mute all transports
     */
    muteAllTransports() {
        Object.keys(this._transports).forEach(key => this._transports[key].silent = true);
    }

    /**
     * Unmute all transports
     */
    unmuteAllTransports() {
        Object.keys(this._transports).forEach(key => this._transports[key].silent = false);
    }
}

module.exports = WinstonLogger;
