'use strict'

const pino = require('pino')

let logger = null

const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
  logger = pino({
    prettyPrint: {
      ignore: 'pid,hostname',
      translateTime: true
    }
  })
} else {
  logger = pino({
    prettyPrint: {
      colorize: false,
      ignore: 'pid,hostname',
      translateTime: true
    }
  })
}

exports.logger = logger
