const winston = require('winston');

module.exports = consoleConfig => {
    const config = {
        ...{
            format: winston.format.combine(
                winston.format.simple(),
                winston.format.colorize({
                    all: true
                }),
            ),
            level: 'info',
        },
        ...consoleConfig
    }
    return new winston.transports.Console(config);
}