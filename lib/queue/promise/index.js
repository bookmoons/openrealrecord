/** @module openrealrecord/queue/promise */

const PromiseQueue = require('./base')
const NodeEventPromiseQueue = require('./nodeevent')

Object.assign(module.exports, {
  PromiseQueue,
  NodeEventPromiseQueue
})
