const { Client } = require('@elastic/elasticsearch');
const ecsFormat = require('@elastic/ecs-winston-format');
const winstonElasticsearch = require('winston-elasticsearch');

module.exports = esConfig => {
    const client = new Client({ node: esConfig.host });
    const esTransportOpts = {
            level: esConfig.level || 'info',
            client: client,
            format: esConfig.format || ecsFormat()
        };
    const esTransport = new winstonElasticsearch.ElasticsearchTransport(esTransportOpts);
    esTransport.on('Error', error => {
        console.error('Error caught', error);
    });
    esTransport.on('warning', msg => {
        console.error('Warning caught', msg);
    });
    return esTransport;
};