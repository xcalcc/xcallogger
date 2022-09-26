const openTracing = require('opentracing');
const url = require('url');
const initTracer = require('jaeger-client').initTracer;

module.exports = jaegerConfig => {
    //https://github.com/jaegertracing/jaeger-client-node/blob/master/src/configuration.js#L37
    const config = {
        serviceName: jaegerConfig.serviceName,
        reporter: {
            // Provide the traces endpoint; this forces the client to connect directly to the Collector and send
            // spans over HTTP
            collectorEndpoint: url.resolve(jaegerConfig.collectorUrl || '', '/api/traces'),
            // Provide username and password if authentication is enabled in the Collector
            // username: '',
            // password: '',
            // agentHost: jaegerConfig.agentHost || 'localhost',
            // agentPort: jaegerConfig.agentPort || 6832,
            // agentSocketType: jaegerConfig.agentSocketType || 'udp4',
            // logSpans: true,
        },
        sampler: {
            type: jaegerConfig.samplerType || 'probabilistic',
            param: jaegerConfig.sampleRate || 0.01 // 1/100 will be sampled
        }
    };

    const options = {
        tags: {
            [`${jaegerConfig.serviceName}.version`]: jaegerConfig.serviceVersion,
        },
        // metrics: metrics,
        // 'logger': {
        //     'info': function logInfo(msg) {
        //         console.log('INFO ', msg)
        //     },
        //     'error': function logError(msg) {
        //         console.log('ERROR', msg)
        //     }
        // }
    };

    const jaeger = initTracer(config, options);
    openTracing.initGlobalTracer(jaeger)
    jaeger.openTracing = openTracing;
    return jaeger;
};
