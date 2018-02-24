'use strict'

const fp = require('fastify-plugin')
const debug = require('debug')('fastify-acl-auth:plugin')

const auth = require('./lib/auth')
const util = require('./lib/util')

const defaults = {
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

let instanceOptions

const hookFactory = function (fastify, options) {
  return async function (request, reply) {
    debug('hook called')
    try {
      const _actual = await util.getRoles(options.actualRoles, request)
      const _allowed = await util.getRoles(options.allowedRoles, request)
      const isAuthorized = await auth.isAuthorized(_actual, _allowed, options)
      debug('_actual: %j', _actual)
      debug('_allowed: %j', _allowed)
      debug('isAuthorized: %j', isAuthorized)
      if (!isAuthorized) {
        return reply.code(403).send()
      }
    } catch (err) {
      debug('ERROR: in hook: %s', err.message)
      return err
    }
  }
}

const plugin = async function (fastify, options) {
  debug('plugin() called')
  fastify.register(require('fastify-url-data'))
  const pluginOptions = Object.assign({}, instanceOptions, options)
  debug('pluginOptions: %j', pluginOptions)
  plugin.options = pluginOptions
  const hook = hookFactory(fastify, pluginOptions)
  fastify.addHook('preHandler', hook)
}

const pluginFactory = function (options) {
  debug('pluginFactory() called')
  instanceOptions = Object.assign({}, defaults, options)
  debug('instanceOptions: %j', instanceOptions)
  plugin.options = instanceOptions
  return fp(
    plugin,
    {
      fastify: '>=1.0.0-rc.1'
    }
  )
}

module.exports = pluginFactory
