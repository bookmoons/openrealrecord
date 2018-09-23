/** @module openrealrecord/queue/promise/base */

/**
 * Queue with `Promise` based interface.
 * @abstract
 */
class PromiseQueue {
  constructor () {
    if (new.target === PromiseQueue) {
      throw new Error('constructed abstract class')
    }
  }

  /**
   * Promise for next value.
   *
   * Resolves with next value added to queue.
   * Resolves immediately if a value is already buffered.
   *
   * Rejects with the cause if the queue becomes errored.
   * Rejects immediately if the queue is already errored.
   *
   * Each access provides a promise for a new value. If values are not
   * available requests are buffered to be resolved with added values. Requests
   * are fulfilled in order received with values added in order received.
   *
   * @var {Promise}
   * @readonly
   * @abstract
   */
  get next () { throw new Error('accessed abstract property') }
}

Object.freeze(PromiseQueue)
Object.freeze(PromiseQueue.prototype)

module.exports = PromiseQueue
