var AWS = require('aws-sdk');

var config = require('./air.config.json');
AWS.config.update({accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey});

var s3 = new AWS.S3();

module.exports = {
  getLogs: function(filter, successCallback, errorCallback) {
    this.listLogs(filter, 100, function(log) {
      successCallback(log.Contents);
    }, errorCallback);
  },
  getLog: function(key, successCallback, errorCallback) {
    var params = {
      Bucket: config.s3.bucket,
      Key: key,
    };
    s3.getObject(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        errorCallback(err);
        return;
      }
      if (!data.Body){
        errorCallback('No data.Body');
        return; 
      }
      successCallback(data.Body.toString());
    });
  },
  listLogs: function(query, count, successCallback, errorCallback) {
    var prefix = '';

    if (query.station) {
      prefix += query.station;
    }

    if (query.date) {
      prefix += '.' + query.date;
    }

    var params = {
      Bucket: config.s3.bucket,
      MaxKeys: count,
      Prefix: prefix
    };
    s3.listObjects(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        errorCallback(err);
      }
      else {
        successCallback(data.Contents);
      }
    });
  }
}