var config = require('./air.config.json');

var s3client = require('./clients/s3');
var esclient = require('./clients/elasticsearch');
var stationFilter = require('./modules/stationFilter');

var queue = [];
var ops = {
  'backfill': []
};

/*
 * Error callback.
 */
var handleError = function (error, response) {
  console.log('ERROR', error, response);
};

/*
 * Log handling.
 */
var processLogs = function (logs) {
  queue = queue.concat(logs);
};

var setProcessed = function (queueItem) {
  queueItem.processing = false;
  queueItem.processed = true;
};

var processLog = function (logMeta, next) {
  s3client.getLog(logMeta.Key, function (log) {
    log = JSON.parse(log);
    delete log.date;
    delete log.time;
    if (next) {
      next();
    }
    esclient.save(log, function (response) {
      
    }, handleError);
  }, handleError);
};

/*
 * Create backfill queue.
 */
var processStation = function (station) {
  console.log('listLogs() ->', stationFilter.filterString(station + '.', ''));
  s3client.listLogs(stationFilter.filterString(station + '.', ''), 3500, function (logs) {
    processLogs(logs);
    if (stationFilter.year >= 2013) {
      stationFilter.stepBack();
      processStation(station);
    }
  }, handleError);
};

var processQueue = (function () {
  var i = 0;
  for (var item in queue) {
    if (!queue[item].processed && !queue[item].processing) {
      queue[item].processing = true;
      var queueItem = queue[item];
      processLog(queueItem, setProcessed(queueItem));
      if (i > 10) {
        break;
      }
      i++;
    }
  }
});

// Run.
setInterval(function () {

  console.log('Total|New|Done|Processing'
              ,queue.length
              ,queue.filter(function (item) { return !item.processed; }).length
              ,queue.filter(function (item) { return item.processed; }).length
              ,queue.filter(function (item) { return item.processing; }).length
  );

  // Queue.
  if (queue.filter(function (item) { return item.processing; }).length <= 0) {
    processQueue();
  }

  // Backfill.
  config.stations.map(function (station) {
    if (ops.backfill.indexOf(station) < 0) {
      console.log('Process station', station);
      ops.backfill.push(station);
      processStation(station);
    }
  });

  if (queue.length == 0) {
    return;
  }

  if (queue.filter(function (item) { return item.processing; }).length > 0) {
    return;
  }
  
  // TODO: process current month.

}, 3000);