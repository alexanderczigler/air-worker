'use strict'

var q = require('q')

var AWS = require('aws-sdk')
AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY})

var s3 = new AWS.S3()

module.exports = {
  getLog: key => {
    var params = {
      Bucket: process.env.S3_BUCKET,
      Key: key
    }
    return q.promise((resolve, reject) => {
      s3.getObject(params, function(err, data) {
        if (err) {
          reject(err)
        }
        if (!data.Body){
          reject('Missing data.Body')
        }
        resolve(data.Body.toString())
      })
    })
  },
  listLogs: (prefix, count, successCallback, errorCallback) => {
    var params = {
      Bucket: process.env.S3_BUCKET,
      MaxKeys: count,
      Prefix: prefix
    }
    s3.listObjects(params, function(err, data) {
      if (err) {
        errorCallback(err)
      }
      else {
        successCallback(data.Contents)
      }
    })
  },
  moveLog: (oldKey, newKey) => {
    var copyParams = {
      Bucket: process.env.S3_BUCKET,
      CopySource: process.env.S3_BUCKET + '/' + oldKey,
      Key: newKey
    }
    var deleteParams = {
      Bucket: process.env.S3_BUCKET,
      Key: oldKey
    }
    return q.promise((resolve, reject) => {
      s3.copyObject(copyParams, function (err) {
        if (err) {
          reject(err)
        } else {
          s3.deleteObject(deleteParams, function (err){
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        }
      })
    })
  }
}
