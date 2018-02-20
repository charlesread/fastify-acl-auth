'use strict'

const fastify = require('fastify')()

const aclFactory = require('fastify-acl-auth')

const hierarchyAcl = aclFactory({hierarchy: ['user', 'admin', 'superuser']})

const credentials = {
  id: 'bc965eb1-a8a4-4320-9172-726e9a7e83c9',
  username: 'cread',
  roles: 'admin'
}

fastify.decorateRequest('session', {credentials})

fastify.register(function (fastifyScope, opts, next) {
  fastifyScope.register(
    hierarchyAcl,
    {
      allowedRoles: ['user']
    }
  )
  // 200, because 'admin' > 'user' in hierarchy
  fastifyScope.get('/user', function (request, reply) {
    return reply.send('/user')
  })
  next()
})

fastify.register(function (fastifyScope, opts, next) {
  fastifyScope.register(
    hierarchyAcl,
    {
      allowedRoles: ['admin']
    }
  )
  // 200
  fastifyScope.get('/admin', function (request, reply) {
    return reply.send('/admin')
  })
  next()
})

fastify.register(function (fastifyScope, opts, next) {
  fastifyScope.register(
    hierarchyAcl,
    {
      allowedRoles: ['superuser']
    }
  )
  // 403
  fastifyScope.get('/superuser', function (request, reply) {
    return reply.send('/superuser')
  })
  next()
})

fastify.listen(8080, function (err) {
  if (err) throw err
  console.log('listening on %s', fastify.server.address().port)
})
