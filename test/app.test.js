/* eslint-env node, mocha */
'use strict'

const assert = require('assert')
require('power-assert')
const request = require('supertest')

const myApp = require('../app')

describe('app', function () {
  let app, db, client

  beforeEach(async () => {
    [app, db] = await myApp.bootstrap()
    await myApp.setupDatabase(db)
    client = request(app)
  })

  afterEach(async () => {
    await db.query('DROP TABLE note;')
    await db.end()
  })

  it('should connect db', () => {
    return client
      .get('/counter')
      .expect(200)
      .then((response) => {
        assert(response.text === '0')
      })
  })

  it('should add item', async () => {
    await client.get('/app')
    const res = await client.get('/counter').expect(200)
    assert(res.text === '1')
  })
})
