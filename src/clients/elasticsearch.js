var elasticsearch = require('elasticsearch');
var config = require('../air.config.json');
var client = new elasticsearch.Client({
  host: config.elasticsearch.host + ':' + config.elasticsearch.port,
  log: 'trace'
});

module.exports = {
  save: function (log, successCallback, errorCallback) {
    log.date = "";
    log.time = "";
    client.index({
      index: config.elasticsearch.index,
      type: 'reading',
      body: log
    }, function (error, response) {
      if (error) {
        errorCallback(error, response);
      }
      else {
        successCallback(response, log);
      }
    });
  }
};