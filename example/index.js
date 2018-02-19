'use strict'

const fastify = require('fastify')()

const fastifyAclAuth = require('fastify-acl-auth')({hierarchy: ['user', 'admin', 'superuser']})

const cread = {
  id: 970,
  username: 'cread',
  roles: ['superuser']
}

fastify
// mock an authentication provider that sets request.session.credentials upon authentication
// by default fastify-acl0-auth compares allowedRoles to request.session.credentials.roles
  .decorateRequest('session', {credentials: cread})
  // these routes require the "user" role
  .register(async function (f) {
    f
      .register(
        fastifyAclAuth,
        {
          allowedRoles: ['user']
        }
      )
      .get('/user', async function () {
        return 'Welcome to /user'
      })
  })
  // these routes require the "admin" role
  .register(async function (f) {
    f
      .register(
        fastifyAclAuth,
        {
          allowedRoles: ['admin']
        }
      )
      .get('/admin', async function () {
        return 'Welcome to /admin'
      })
  })
  // these routes require the "superuser" role
  .register(async function (f) {
    f
      .register(
        fastifyAclAuth,
        {
          allowedRoles: ['superuser']
        }
      )
      .get('/superuser', async function () {
        return 'Welcome to /superuser'
      })
  })
  .listen(3000, function (err) {
    if (err) throw err
  })