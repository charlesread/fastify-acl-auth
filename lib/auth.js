'use strict'

const path = require('path')

const _ = require('lodash')
const debug = require('debug')('fastify-acl-auth:auth')

const util = require(path.join(__dirname, 'util.js'))

const defaults = {
  any: true,
  all: false
}

const implementation = async function (_actual, _allowed, _options) {
  debug('auth implementation called')
  _options = Object.assign({}, defaults, _options)

  const actual = await util.getRoles(_actual)
  const allowed = await util.getRoles(_allowed)

  if (_options.hierarchy) {
    let lowestAllowedIndex = 50
    let highestActualIndex = -1
    for (let actualRole of actual) {
      let i = _options.hierarchy.indexOf(actualRole)
      if (i >= 0 && i > highestActualIndex) {
        highestActualIndex = i
      }
    }
    for (let allowedRole of allowed) {
      let i = _options.hierarchy.indexOf(allowedRole)
      if (i >= 0 && i < lowestAllowedIndex) {
        lowestAllowedIndex = i
      }
    }
    return (highestActualIndex >= lowestAllowedIndex)
  }
  const intersection = _.intersection(allowed, actual)
  if (_options.all) {
    return (intersection.length === allowed.length)
  }
  return (_options.any && intersection.length > 0)
}

module.exports = {
  isAuthorized: implementation
}
