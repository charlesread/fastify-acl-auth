'use strict'

const type = require('type-detect')
const debug = require('debug')('fastify-acl-auth:util')

const util = {}

util.getRoles = async function (obj, passthrough) {
  const objType = type(obj)
  debug('objType: %s', objType)
  let returnArray = []
  if (objType === 'Array') {
    returnArray = obj
  } else if (objType === 'string') {
    returnArray.push(obj)
  } else if (objType === 'function') {
    let res
    res = obj(passthrough)
    returnArray = res.then ? await res : res
  }
  return returnArray
}

module.exports = util
