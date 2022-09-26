const Logger = require('./index');
const path = require('path');

const logger = new Logger({
    serviceName: 'service-a',
    serviceVersion: '1.0.0',
    jaegerConfig: {
        // agentHost: '127.0.0.1',
        // agentPort: 14250,
        collectorUrl: 'http://127.0.0.1:14268',
        sampleRate: 1,
        sampleType: 'probabilistic', //const, probabilistic, ratelimiting, remote
    },
    consoleConfig: {
        format: 'timelyPlain',
    },
    logstashConfig: {
        mode: 'tcp',
        host: 'localhost',
        port: 5000,
        applicationName: 'Logger-node',
        localhost: 'Logger-node',
        pid: process.pid
    },
    fileConfig: {
        level: 'info',
        key: 'file-info',
        rotation: true,
        dirname: path.resolve(__dirname,  './logs/info')
    },
    // elasticsearchConfig: {
    //     host: 'http://127.0.0.1:9200',
    //     level: 'info'
    // },
});
const meta = {
    file: 'test',
    method: 'direct',
    correlationId: '112233445566',
    pid: process.pid
}

logger.info('Hello, this is info test! No console.', meta, false);
logger.error('Hello, this is error test!', meta);
logger.warn('Hello, this is warning test!', meta);
logger.info('Hello, this is info test! With console.', meta);
logger.fatal('Hello, looks like this program is fxxxd up.', meta);
const newFileLocation = path.resolve(__dirname, './newLocation');
logger.changeLogFileLocation('file-info', newFileLocation);
logger.info(`New logs saved in new place [${newFileLocation}]`, meta);
process.exit(0);

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

// for(let i=0;i<2;i++) {
//
//     const newSpan = logger.createTracerSpan(`/test`);
//     newSpan.addTags({
//         [newSpan.openTracing.Tags.SPAN_KIND]: newSpan.openTracing.Tags.SPAN_KIND_MESSAGING_CONSUMER,
//     });
//     newSpan.setTag(newSpan.openTracing.Tags.SAMPLING_PRIORITY, 1)
//     console.log(`Jaeger log for span`);
//     newSpan.finish();
//     wait(1000);
// }
//
// process.exit(1);
// for(let i=0;i<100;i++) {
//
//     logger.info('Hello, this is info test!', {...meta, seq: i});
//     wait(1000);
// }
