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
      values: [],
      errored: false,
      error: null
    }
    privs.set(this, priv)
    const add = protm.add.bind(this)
    const fail = protm.fail.bind(this)
    if (new.target === PromiseQueue) Object.freeze(this)
    exposer({ add, fail })
  }

  get next () {
    const priv = privs.get(this)
    if (priv.errored) return Promise.reject(priv.error)
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
    if (priv.errored) {
      const error = new Error('queue add while errored')
      error.cause = priv.error
      throw error
    }
    if (priv.requests.length) {
      const request = priv.requests.shift()
      request.resolve(value)
    } else priv.values.push(value)
  },

  /**
   * Fail queue.
   *
   * No effect if already errored.
   *
   * @implements {DeliverError}
   */
  fail (error) {
    const priv = privs.get(this)
    if (priv.errored) return
    priv.errored = true
    priv.error = error
    priv.values = null
    for (const request of priv.requests) request.reject(error)
    priv.requests = null
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
 * Deliver error.
 *
 * @callback DeliverError
 *
 * @param {Error} error - Error to deliver.
 *     Message `'queue add while errored'`.
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
