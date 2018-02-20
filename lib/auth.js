'use strict'

const _ = require('lodash')
const type = require('type-detect')

const defaults = {
  any: true,
  all: false
}

const implementation = async function (_actual, _allowed, _options) {
  _options = Object.assign({}, defaults, _options)

  let res
  let allowed = []
  let actual = []

  if (type(_allowed) === 'Array') {
    allowed = _allowed
  } else if (type(_allowed) === 'string') {
    allowed.push(_allowed)
  } else if (type(_allowed) === 'function') {
    res = _allowed(_options)
    allowed = res.then ? await res : res
  }

  if (type(_actual) === 'Array') {
    actual = _actual
  } else if (type(_actual) === 'string') {
    actual.push(_actual)
  } else if (type(_actual) === 'function') {
    res = _actual(_options)
    actual = res.then ? await res : res
  }

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
  determineAuthorization: implementation,
  isAuthorized: implementation
}
