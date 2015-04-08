var config = require('./air.config.json');

var s3client = require('./clients/s3');
var esclient = require('./clients/elasticsearch');
var stationFilter = require('./modules/stationFilter');

var queue = [];

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
var processStation = function (station, next) {
  for (var i = 31; i > 0; i--) {
    var suffix = i;
    if (i < 10) {
      suffix = '0' + suffix;
    }
    var filter = stationFilter.filterString(station + '.', suffix);
    s3client.listLogs(filter, 3500, function (logs) {
      processLogs(logs);
      next();
    }, handleError);
  }
};



var takeNext = (function () {
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
  
  console.log('items in queue: ', queue.length);
  console.log('           new: ', queue.filter(function (item) { return !item.processed; }).length);
  console.log('     processed: ', queue.filter(function (item) { return item.processed; }).length);
  console.log('    processing: ', queue.filter(function (item) { return item.processing; }).length);
  console.log();

  // Queue.
  if (queue.filter(function (item) { return item.processing; }).length <= 0) {
    takeNext();
  }

  // Backfill.
  if (queue.filter(function (item) { return !item.processed; }).length <= 0) {
    config.stations.map(function (station) {
      processStation(station, function () {
        if (stationFilter.year >= 2013) {
          stationFilter.stepBack();
        }
      });
    });
  }
  
}, 1000);