var config = require('./air.config.json');
var s3client = require('./s3client');
var esclient = require('./esclient');

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
		console.log('Process log', log);
		esclient.save(log);
	}, handleError);
};

s3client.listLogs('', 100, processLogs, handleError);

setTimeout(function () {
	s3client.listLogs('', 100, processLogs, handleError);
}, 300000);