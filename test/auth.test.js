'use strict'

const tap = require('tap')
const test = tap.test

const auth = require('../lib/auth')

test(async function (t) {
  t.plan(13)
  t.true(await auth.isAuthorized('admin', 'admin'), 'admin can access admin')
  t.false(await auth.isAuthorized('user', 'admin'), 'user can\'t access admin')
  t.true(await auth.isAuthorized(['user'], 'user'), '[user] can access user')
  t.true(await auth.isAuthorized(['user'], ['user']), '[user] can access [user]')
  t.true(await auth.isAuthorized('user', ['user']), 'user can access [user]')
  t.true(await auth.isAuthorized(function(){return ['user']}, ['user']), 'user can access [user]')
  t.true(await auth.isAuthorized(async function(){return ['user']}, ['user']), 'user can access [user]')
  t.true(await auth.isAuthorized(['user'], function(){return ['user']}), '[user] can access user')
  t.true(await auth.isAuthorized(['user'], async function(){return ['user']}), '[user] can access user')
  t.false(await auth.isAuthorized(['a'], ['a', 'b'], {all: true}), 'all should cause a false return when not all roles are present')
  t.true(await auth.isAuthorized(['b', 'a'], ['a', 'b'], {all: true}), 'all should cause a trut return when all roles are present')
  t.false(await auth.isAuthorized('admin', 'user'), 'admin can\'t access user')
  t.true(await auth.isAuthorized('admin', 'user', {hierarchy: ['user', 'admin']}), 'admin can access user with appropriate hierarchy')
})