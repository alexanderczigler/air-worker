var AWS = require('aws-sdk');
var q = require('q');

var config = require('../air.config.json');
AWS.config.update({accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey});

var s3 = new AWS.S3();

module.exports = {

  // Gets a specific log.
  getLog: function(key) {
    var params = {
      Bucket: config.s3.bucket,
      Key: key
    };
    var defer = q.defer();
    s3.getObject(params, function(err, data) {
      if (err) {
        defer.reject(err);
      }
      if (!data.Body){
        defer.reject('Missing data.Body');
      }
      defer.resolve(data.Body.toString());
    });
    return defer.promise;
  },

  // Returns a list result.
  listLogs: function(prefix, count, successCallback, errorCallback) {
    var params = {
      Bucket: config.s3.bucket,
      MaxKeys: count,
      Prefix: prefix
    };
    s3.listObjects(params, function(err, data) {
      if (err) {
        errorCallback(err);
      }
      else {
        successCallback(data.Contents);
      }
    });
  },

  // Copies a log and then deletes the source.
  moveLog: function(oldKey, newKey) {
    var copyParams = {
      Bucket: config.s3.bucket,
      CopySource: config.s3.bucket + '/' + oldKey,
      Key: newKey
    };
    var deleteParams = {
      Bucket: config.s3.bucket,
      Key: oldKey
    };
    var defer = q.defer();
    s3.copyObject(copyParams, function (err) {
      if (err) {
        defer.reject(err);
      } else {
        s3.deleteObject(deleteParams, function (err){
          if (err) {
            defer.reject(err);
          } else {
            defer.resolve();
          }
        });
      }
    });
    return defer.promise;
  }
}