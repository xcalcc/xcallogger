const winston = require('winston');
require('winston-daily-rotate-file');

module.exports = fileConfig => {
    let filename = 'log-%DATE%.log';
    if (fileConfig.level && fileConfig.level === 'error') {
        filename = 'error-%DATE%.log';
    }
    const config = {
        ...{
            filename,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '15m',
            maxFiles: 14,
            dirname: './logs',
            format: winston.format.simple(),
        },
        ...fileConfig
    };
    if (fileConfig.rotation) {
        return new winston.transports.DailyRotateFile(config);
    }
    return new winston.transports.File(config);
}