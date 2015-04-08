var config = require('./air.config.json');

var s3client = require('./clients/s3');
var esclient = require('./clients/elasticsearch');

var queue = [];

var now = new Date();
var year = now.getFullYear();
var month = now.getMonth() + 1;

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

var processLog = function (logMeta, next) {
  s3client.getLog(logMeta.Key, function (log) {
    console.log('Queue has items', queue.length);
    console.log('log is', log.id);
    esclient.save(log, function (response, tada) {
      queue = queue.filter(function (item) {
        return item.Key != tada.id;
      });
      next(next);
    }, handleError);
  }, handleError);
};

/*
 * Create backfill queue.
 */
var processStation = function (station, year, month) {
  var monthStr = '';
  if (month < 10) {
    monthStr = '0' + month;
  } else {
    monthStr = month;
  }

  for (var i = 1; i <= 31; i++) {
    var f = i;
    if (i < 10) {
      f = '0' + f;
    }
    var filter = station + '.' + year + monthStr + f;
    console.log('Processing filter', filter);
    s3client.listLogs(filter, 3500, processLogs, handleError);
  }
  if (year > 2013 && month <= 1) {
    processStation(station, year - 1, 12);
  } else if (year > 2013) {
    processStation(station, year, month - 1);
  }
};

var takeNext = function (callback) {
  var meow = queue.filter(function (item) {
    return !item.processed;
  })[0];
  console.log('meow', meow);
};

/*
 * Run - for each station in config.
 */
config.stations.map(function (station) {
  processStation(station, year, month);
});

var takeNext = (function (next) {
  var nextItem = queue[0];
  if (nextItem) {
    console.log('Have item, will work');
    processLog(nextItem, next);
  }
  else {
    console.log('Nothing, waiting...');
    setTimeout(function () {
      next(next);
    }, 100);
  }
});

takeNext(takeNext);