var s3client = require('./lib/clients/s3');
var esclient = require('./lib/clients/elasticsearch');
var q = require('q');

var worker = require('./lib/worker')

var __intervalId = 0;
var __queue = [];

var handleLogs = function () {
  __queue.map(function (logMeta) {
    s3client.getLog(logMeta.Key)
      .then(function (log) {
        log = JSON.parse(log);
        delete log.date;
        delete log.time;
        esclient.save(log)
          .then(function () {
            moveLog(logMeta.Key, function () {
              console.log('Moved %key% to imported/'.replace('%key%', logMeta.Key));
              __queue.splice(logMeta);
            });
          })
          .catch(function (error) {
            console.log('Could not save log %key% in ElastcSearch'
              .replace('%key%', logMeta.Key));
            __queue.splice(logMeta);
          });
      })
      .catch(function (error) {
        console.log('Could not get log %key% (%message%)'
          .replace('%key%', logMeta.Key)
          .replace('%message%', error));
        __queue.splice(logMeta);
      });
  });
};

var traverseQueue = () => {
  __queue.map(key => {
    console.log(' => Process', key)
    worker.get(key).then(log => {
      // Save to ES
      log = JSON.parse(log);
      delete log.date;
      delete log.time;

      return
    })
  })
}

console.log('## air-worker started');

/*
 * Run.
 */
__intervalId = setInterval((function intervalProcess () {

  // Add logs to queue.
  worker.list().then(logs => {
    logs.map(log => {
      if (__queue.indexOf(log.Key) === -1) {
        __queue.push(log.Key)
      }
    })
  })

  // Work the queue.
  traverseQueue()

  return intervalProcess;
})(), process.env.INTERVAL)
