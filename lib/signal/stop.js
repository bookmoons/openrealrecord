/** @module signal/stop */

/**
 * Stop signal.
 *
 * Requests stop of a process.
 */
class StopSignal {
  constructor () {
    if (new.target === StopSignal) Object.freeze(this)
  }
}

Object.freeze(StopSignal)
Object.freeze(StopSignal.prototype)

module.exports = StopSignal
