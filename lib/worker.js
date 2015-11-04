'use strict'

var q = require('q')
var s3client = require('./clients/s3')

module.exports = {
  list: () => {
    return q.promise((resolve) => {
      s3client.listLogs(process.env.S3_PATH_UPLOAD, process.env.S3_TAKE, logs => {
        resolve(logs)
      })
    })
  }
}
