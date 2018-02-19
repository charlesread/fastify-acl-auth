'use strict'

const type = require('type-detect')

const util = {}

util.getRoles = async function (obj, passthrough) {
  let returnArray = []
  if (type(obj) === 'Array') {
    returnArray = obj
  } else if (type(obj) === 'string') {
    returnArray.push(obj)
  } else if (type(obj) === 'function') {
    let res
    res = obj(passthrough)
    returnArray = res.then ? await res : res
  }
  return returnArray
}

module.exports = util
