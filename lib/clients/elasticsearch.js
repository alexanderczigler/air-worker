var elasticsearch = require('elasticsearch');
var q = require('q');

var config = require('../air.config.json');
var client = new elasticsearch.Client({
  host: config.elasticsearch.host + ':' + config.elasticsearch.port,
  log: 'error'
});

module.exports = {
  save: function (log) {
    var defer = q.defer();
    client.index({
      index: config.elasticsearch.index,
      type: 'reading',
      body: log
    }, function (error, response) {
      if (error) {
        defer.reject(error);
      }
      else {
        defer.resolve(response);
      }
    });
    return defer.promise;
  }
};