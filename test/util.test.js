'use strict'

const tap = require('tap')
const test = tap.test

const util = require('../lib/util')

const roles = ['a', 'b', 'c']

test(async function (t) {
  t.plan(4)
  t.same(await util.getRoles(roles), roles)
  t.same(await util.getRoles('a'), ['a'])
  t.same(await util.getRoles(function() {return ['a', 'b', 'c']}), roles)
  t.same(await util.getRoles(async function() {return ['a', 'b', 'c']}), roles)
})