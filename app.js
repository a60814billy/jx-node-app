'use strict'

const express = require('express')
const chance = require('chance')()
const { Client } = require('pg')
const { logger } = require('./logger')

const PORT = process.env.PORT || 8080
const DB_URL = process.env.DB_URL || 'postgresql://raccoon@localhost/jxapp'

function setupWebServer (app, db) {
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

  app.get('/counter', async function (req, res) {
    try {
      const result = await db.query('SELECT count(*) FROM note;')
      res.send(result['rows'][0]['count'])
    } catch (e) {
      res.status(500).send(e)
    }
  })

  app.get('/app', async function (req, res) {
    try {
      const data = [chance.word(), chance.word()]
      logger.info(data)
      await db.query('INSERT INTO note(name, content) VALUES ($1, $2);', data)
      res.send(data)
    } catch (e) {
      console.log(e)
      res.status(500).send(e)
    }
  })

  app.get('*', function (req, res) {
    logger.warn(`path not found (${req.path})`)
    res.status(404).send({
      message: 'path not found'
    })
  })
}

async function setupDatabase (db) {
  await db.query('CREATE TABLE IF NOT EXISTS note (name text, content text);')
}

async function bootstrap () {
  let dbClient = new Client({
    connectionString: DB_URL
  })
  await dbClient.connect()
  await setupDatabase(dbClient)

  const app = express()
  setupWebServer(app, dbClient)

  return [app, dbClient]
}

async function main () {
  try {
    logger.info('server starting, connecting database')
    const [app, db] = await bootstrap()
    logger.info(`Starting server listening on :${PORT}`)
    app.listen(PORT)
    process.on('SIGTERM', function () {
      logger.info('Server will be shutting down')
      db.end()
    })
  } catch (e) {
    logger.error(`cannot connect database ${e}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

exports.bootstrap = bootstrap
exports.setupDatabase = setupDatabase
