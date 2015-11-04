var elasticsearch = require('elasticsearch');
var q = require('q');

var client = new elasticsearch.Client({
  host: process.env.ES_HOST + ':' + process.env.ES_PORT,
  log: 'error'
});

module.exports = {
  save: function (log) {
    var defer = q.defer();
    client.index({
      index: process.env.ES_INDEX,
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
