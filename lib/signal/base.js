/** @module signal/base */

/**
 * Signal base class.
 *
 * @abstract
 */
class Signal {
  constructor () {
    if (new.target === Signal) throw new Error('constructed abstract clas')
  }
}

Object.freeze(Signal)
Object.freeze(Signal.prototype)

module.exports = Signal
