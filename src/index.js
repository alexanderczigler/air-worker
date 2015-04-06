var config = require('./air.config.json');
var s3client = require('./s3client');
var esclient = require('./esclient');

var now = new Date();
var year = now.getFullYear();
var month = now.getMonth() + 1;

var handleError = function (error) {
  console.log('ERROR', error);
};

var processLogs = function (logs) {
  console.log('Found', logs.length);
  logs.map(function (log) {
    processLog(log);
  });
};

var processLog = function (logMeta) {
  s3client.getLog(logMeta.Key, function (log) {
    esclient.save(log);
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

config.stations.map(function (station) {
  processStation(station, year, month);
});
