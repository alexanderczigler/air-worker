var config = require('./air.config.json');
var s3client = require('./s3client');
var esclient = require('./esclient');

var queue = [];

var now = new Date();
var year = now.getFullYear();
var month = now.getMonth() + 1;

var handleError = function (error) {
  console.log('ERROR', error);
};

var processLogs = function (logs) {
  logs.map(function (log) {
    processLog(log);
  });
};

var processLog = function (logMeta) {
  s3client.getLog(logMeta.Key, function (log) {
    queue.push({
      key: log.id,
      log: log,
      processed: false
    });
    console.log('Queue has items', queue.length);
    //esclient.save(log);
  }, handleError);
};

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
  esclient.save(queue.filter(function (item) {
    return item.processed;
  })[0]);
  setTimeout(function () {
    callback();
  }, 200);
};

config.stations.map(function (station) {
  processStation(station, year, month);
});

