var elasticsearch = require('elasticsearch');
var config = require('./air.config.json');
var client = new elasticsearch.Client({
  host: config.elasticsearch.host + ':' + config.elasticsearch.port,
  log: 'trace'
});

module.exports = {
  save: function (log) {
    log.date = log.Date;
    client.index({
      index: config.elasticsearch.index,
      type: 'reading',
      body: log
    }, function (error, response) {
      if (error) {
        console.log('Error in esclient.save', error, response);
      }
      else {
        console.log('OK', response);
      }
    });
  }
};