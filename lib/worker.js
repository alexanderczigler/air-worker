'use strict'

var q = require('q')
var s3client = require('./clients/s3')

module.exports = {
  list: () => {
    return q.promise(resolve => {
      s3client.listLogs(process.env.S3_PATH_UPLOAD, process.env.S3_TAKE, logs => {
        resolve(logs)
      })
    })
  },
  get: key => {
    return q.promise(resolve => {
      s3client.getLog(key).then(log => {
        resolve(log)
      })
    })
  },
  move: (source, destination) => {
    
  }
}



/*
var moveLog = function(key, callback) {
  // S3_PATH_UPLOAD
  // S3_PATH_ARCHIVE
  var dest = key.replace('new/', 'imported/');
  s3client.moveLog(key, dest)
  .catch(function (error) {
    console.log('Unable to move %key% (%message%)'
      .replace('%key%', key)
      .replace('%message%', error.message)
    );
  })
  .done(callback);
};
*/
