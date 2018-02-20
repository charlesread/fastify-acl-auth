'use strict'

const fastify = require('fastify')()

const aclFactory = require('fastify-acl-auth')

const credentials = {
  id: 'bc965eb1-a8a4-4320-9172-726e9a7e83c9',
  username: 'cread',
  roles: 'vendor'
}

fastify.decorateRequest('session', {credentials})

fastify.register(function (fastifyScope, opts, next) {
  fastifyScope.register(
    aclFactory(
      {
        allowedRoles: ['customer']
      }
    )
  )
  // 403
  fastifyScope.get('/customers', function (request, reply) {
    return reply.send('/customers')
  })
  next()
})

fastify.register(function (fastifyScope, opts, next) {
  fastifyScope.register(
    aclFactory(
      {
        allowedRoles: ['vendor']
      }
    )
  )
  // 200
  fastifyScope.get('/vendors', function (request, reply) {
    return reply.send('/vendors')
  })
  next()
})

fastify.listen(8080, function (err) {
  if (err) throw err
  console.log('listening on %s', fastify.server.address().port)
})
