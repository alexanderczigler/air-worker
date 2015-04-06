var AWS = require('aws-sdk');

var config = require('./air.config.json');
AWS.config.update({accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey});

var s3 = new AWS.S3();

module.exports = {
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
  listLogs: function(prefix, count, successCallback, errorCallback) {
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