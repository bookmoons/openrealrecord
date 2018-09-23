/** @module openrealrecord/queue/promise/base */

const privs = new WeakMap()

/**
 * `Promise` based queue.
 * @implements {IPromiseQueue}
 */
class PromiseQueue {
  /**
   * @param {PromiseQueueExposer} exposer - Protected component exposer.
   */
  constructor (exposer) {
    const priv = {
      requests: [],
      values: []
    }
    privs.set(this, priv)
    const add = protm.add.bind(this)
    if (new.target === PromiseQueue) Object.freeze(this)
    exposer({ add })
  }

  get next () {
    const priv = privs.get(this)
    const request = Object.create(null)
    const promise = new Promise((resolve, reject) => {
      request.resolve = resolve
      request.reject = reject
    })
    if (priv.values.length) {
      const value = priv.values.shift()
      request.resolve(value)
    } else priv.requests.push(request)
    return promise
  }
}

Object.freeze(PromiseQueue)
Object.freeze(PromiseQueue.prototype)

// Protected methods
const protm = {
  /**
   * Add value to queue.
   *
   * @implements {AddValue}
   */
  add (value) {
    const priv = privs.get(this)
    if (priv.requests.length) {
      const request = priv.requests.shift()
      request.resolve(value)
    } else priv.values.push(value)
  }
}

/**
 * Add value to queue.
 *
 * @callback AddValue
 *
 * @param value - Value to add.
 *
 * @throws If adding fails.
 */

/**
 * Expose promise queue protected components.
 *
 * @callback PromiseQueueExposer
 *
 * @param {object} prot - Protected components exposed by promise queue.
 * @param {AddValue} prot.add - Add value to queue.
 */

module.exports = PromiseQueue
