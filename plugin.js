'use strict'

const fp = require('fastify-plugin')

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
    try {
      const _actual = await util.getRoles(options.actualRoles, request)
      const _allowed = await util.getRoles(options.allowedRoles, request)
      const isAuthorized = await auth.isAuthorized(_actual, _allowed, options)
      if (!isAuthorized) {
        return reply.code(403).send()
      }
    } catch (err) {
      return err
    }
  }
}

const plugin = async function (fastify, options) {
  fastify.register(require('fastify-url-data'))
  const hook = hookFactory(fastify, Object.assign({}, instanceOptions, options))
  fastify.addHook('preHandler', hook)
}

const pluginFactory = function (options) {
  instanceOptions = Object.assign({}, defaults, options)
  plugin.options = instanceOptions
  return fp(
    plugin,
    {
      fastify: '>=1.0.0-rc.1'
    }
  )
}

module.exports = pluginFactory