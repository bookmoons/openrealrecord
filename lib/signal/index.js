/**
 * Signal types.
 *
 * Used for delivering asynchronous signals through promises.
 *
 * Useful when a promise may resolve with multiple values that must be
 * distinguished, eg when `Promise.race`ing multiple promises.
 *
 * @module signal
 */

const Signal = require('./base')

Object.assign(module.exports, {
  Signal
})
