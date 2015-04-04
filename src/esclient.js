var elasticsearch = require('elasticsearch');
var config = require('./air.config.json');
var client = new elasticsearch.Client({
    host: config.elasticsearch.host + ':' + config.elasticsearch.port,
    log: 'trace'
});

module.exports = {
	save: function (log) {
		console.log('save', log);
		client.create({
        index: config.elasticsearch.index,
        type: 'reading',
        id: log.id,
        body: log
    }, function (error, response) {
        console.log('Error in esclient.save', error, response);
    });
	}
};