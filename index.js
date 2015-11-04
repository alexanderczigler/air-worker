var s3client = require('./lib/clients/s3');
var esclient = require('./lib/clients/elasticsearch');
var q = require('q');

var worker = require('./lib/worker')

var __intervalId = 0;
var __processQueue = [];

var moveLog = function(key, callback) {
  // S3_PATH_UPLOAD
  // S3_PATH_ARCHIVE
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

/*
 * Run.
 */
__intervalId = setInterval((function intervalProcess () {

  // Add logs to queue.
  worker.list().then(logs => {
    console.log('got', logs)
  })

  // Work the queue.
  // TODO: actually work the queue.

  return intervalProcess;
})(), process.env.INTERVAL)
