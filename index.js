var config = require('./air.config.json');
var s3client = require('./clients/s3');
var esclient = require('./clients/elasticsearch');
var q = require('q');

var __processQueue = [];

var moveLog = function(key, callback) {
  var dest = key.replace('new/', 'imported/');
  s3client.moveLog(key, dest)
  .catch(function (error) {
    console.log('Unable to move %key% (%message%)'
      .replace('%key%', key)
      .replace('%message%', error.message)
    );
  })
  .done(callback);
};

var fillQueue = function () {
  var defer = q.defer();
  s3client.listLogs('new/', 500, function (logs) {
    if (logs.length > 0) {
      console.log('Discovered %n% new logs'.replace('%n%', logs.length));
      __processQueue = __processQueue.concat(logs);
    }
    defer.resolve();
  }, defer.reject);
  return defer.promise;
};

var handleLogs = function () {
  __processQueue.map(function (logMeta) {
    s3client.getLog(logMeta.Key)
      .then(function (log) {
        log = JSON.parse(log);
        delete log.date;
        delete log.time;
        esclient.save(log)
          .then(function () {
            moveLog(logMeta.Key, function () {
              console.log('Moved %key% to imported/'.replace('%key%', logMeta.Key));
              __processQueue.splice(logMeta);
            });
          })
          .catch(function (error) {
            console.log('Could not save log %key% in ElastcSearch'
              .replace('%key%', logMeta.Key));
            __processQueue.splice(logMeta);
          });
      })
      .catch(function (error) {
        console.log('Could not get log %key% (%message%)'
          .replace('%key%', logMeta.Key)
          .replace('%message%', error));
        __processQueue.splice(logMeta);
      });
  });
};

console.log('## air-worker started');

// Run.
setInterval(function (){
  
  if (__processQueue.length === 0) {
    fillQueue()
    .catch(function (error) {
      console.log('An error occurred when listing logs (%message%)'.replace('%message%', error.message));
    })
    .done(function () {
      if (__processQueue.length > 0) {
        handleLogs();
      }
    });
  }

}, 10000);
