'use strict'

const express = require('express')
const { logger } = require('./logger')

const PORT = process.env.PORT || 8080

const app = express()

app.use((req, res, next) => {
  logger.info(`receive request ${req.path} from: ${req.ip}`)
  const start = new Date()
  next()
  const end = new Date() - start
  logger.info('Execute time: %dms', end)
})

app.get('/', function (req, res) {
  res.send({
    message: 'ok'
  })
})

app.get('*', function (req, res) {
  logger.warn(`path not found (${req.path})`)
  res.status(404).send({
    message: 'path not found'
  })
})

logger.info(`Starting server listening on :${PORT}`)
app.listen(PORT)

process.on('SIGTERM', function () {
  logger.info('Server will be shutting down')
})
