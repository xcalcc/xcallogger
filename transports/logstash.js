const WinstonLogStash = require('winston3-logstash-transport');
class LogstashTransportFix extends WinstonLogStash {
    constructor(options) {
        super(options);
    }
    deliverTCP(message, callback) {
        callback = callback || (() => {});
        // \n is a simple to help logstash recognize it is done the socket write
        this.socket.write(`${message}\n`, undefined, callback);
    }
}

module.exports = logstashConfig => {
    const config = {
        ...{
            mode: 'udp',
            host: '127.0.0.1',
            port: '9600'
        },
        ...logstashConfig
    };
    return new LogstashTransportFix(config);
}