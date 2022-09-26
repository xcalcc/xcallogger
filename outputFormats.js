const winston = require("winston");
const moment = require("moment");

module.exports = {
    xc5: (serviceName, serviceVersion) => {
        const pid = process.pid;
        return winston.format.printf(info => {
            const {message, level} = info;
            if (!info.spanId && info.correlationId) {
                info.spanId = info.correlationId;
            }
            return `${moment().format('YYYY-MM-DD HH:mm:ss.ms')} ${level.toUpperCase()} [${serviceName}@${serviceVersion},${info.correlationId || ''},${info.spanId || ''},${info.sampled || 'false'}]${pid} --- [${info.file || ''}]${info.method || ''}: ${message}`;
        })
    },
    plain: () => winston.format.printf(info => info.message),
    timelyPlain: () => {
        return winston.format.printf(info => {
            const {message, level} = info;
            return `${moment().format('YYYY-MM-DD HH:mm:ss.ms')} ${level.toUpperCase()} - ${message}`;
        });
    },
}