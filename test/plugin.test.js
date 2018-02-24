'use strict'

const fastify = require('fastify')
const request = require('request')

let fastifyInstance

const tap = require('tap')
const test = tap.test

const plugin = require('../plugin')

const pluginDefaults = {
  actualRoles: function (request) {
    let _return
    try {
      _return = request.session.credentials.roles
    } catch (err) {
      _return = []
    }
    return _return
  },
  any: true,
  all: false
}

const defaultPlugin = plugin()

fastifyInstance = fastify()

test(function (t) {
  t.plan(7)
  t.ok(defaultPlugin, 'plugin exists')
  t.deepEquals(defaultPlugin.options.any, pluginDefaults.any, 'any is expected')
  t.deepEquals(defaultPlugin.options.all, pluginDefaults.all, 'all is expected')
  t.same(defaultPlugin.options.actualRoles(), [], 'no actual roles by default')
  fastifyInstance.decorateRequest('session', {credentials: {roles: ['user']}})
  fastifyInstance.register(function (f, o, n) {
    f.register(plugin({allowedRoles: ['user']}))
    f.get('/user', async function () {
      return '/user'
    })
    n()
  })
  fastifyInstance.register(function (f, o, n) {
    f.register(plugin({allowedRoles: ['admin']}))
    f.get('/admin', async function () {
      return '/admin'
    })
    n()
  })
  fastifyInstance.register(function (f, o, n) {
    f.register(plugin({allowedRoles: function(){return Symbol('foo')}}))
    f.get('/symbol', async function () {
      return '/symbol'
    })
    n()
  })
  fastifyInstance.listen('8765', function () {
    request({
      uri: 'http://localhost:8765/user'
    },
      function (err, response, body) {
        if (err) throw err
        t.not(err, 'no request error')
        t.is(body, '/user', 'body should be  /user')
        request({
          uri: 'http://localhost:8765/admin'
        },
          function (err, response, body) {
            if (err) throw err
            t.is(response.statusCode, 403, 'admin should return 403')
            fastifyInstance.close(t.end)
            // request({
            //     uri: 'http://localhost:8765/symbol'
            //   },
            //   function (err, response, body) {
            //     if (err) throw err
            //     t.is(response.statusCode, 500, 'bs symbol in allowedRoles should cause error')
            //     fastifyInstance.close(t.end)
            //   })
          })
      })
  })
})
