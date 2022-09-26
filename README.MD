# XcalLogger
A log interface for javascript projects

## Transports
### Console
```json5
#consoleConfig
{
  level: 'info|warn|error',
  format: '', //winston.format.combine()
  
}
```
### File
```json5
#fileConfig (array)
[
    {
    level: 'info',
    rotation: true | false, //if use file rotation
    dirname: './logs/info'
    },
{
    level: 'error',
    rotation: true | false,
    dirname: './logs/error'
    },
]
```
### Logstash
```json5
#logstashConfig
{
    mode: 'udp｜tcp',
    host: String,
    port: Number,
    applicationName: ''
}
```
### Elasticsearch
```json5
#elasticsearchConfig
{
    host: String,
    level: 'info(default)|warn|error',
}
```
### Jaeger (opentracing)
```json5
#jaegerConfig
{
    collectorUrl: String, //url+port
    sampleRate: 0.01, //0.01 presents 1 sample / 100 trace
    sampleType: 'probabilistic' //const, probabilistic, ratelimiting, remote
}
```
## Options
```json5
{
  serviceName, //required
  serviceVersion, //required
  jaegerConfig,
  elasticsearchConfig,
  logstashConfig,
  consoleConfig,
}
```

## Usage
1. Instanciate an instance of log with above configs, default is console log, file config should be an array
2. Methods:
```javascript
const logger = new Logger({configs});
const metaData = {
    file: String, //current file path where log is triggered
    method: String, //current method where log is triggered
    correlationId: String, //indicate correlations, inheritted from upper string or new generated
};
logger.info(message, metaData);
logger.warn(message, metaData);
logger.error(message, metaData);
logger.log('info|warn|error|fatal', message,  metaData);
```

## License

[Apache License v2.0](./LICENSE).