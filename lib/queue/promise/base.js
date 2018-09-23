/** @module openrealrecord/queue/promise/base */

/** @abstract */
class PromiseQueue {
  constructor () {
    if (new.target === PromiseQueue) {
      throw new Error('constructed abstract class')
    }
  }

  /** @abstract */
  get next () { throw new Error('accessed abstract property') }
}

Object.freeze(PromiseQueue)
Object.freeze(PromiseQueue.prototype)

module.exports = PromiseQueue
