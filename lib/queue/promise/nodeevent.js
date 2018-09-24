/** @module openrealrecord/queue/promise/nodeevent */

const PromiseQueue = require('./base')

const privs = new WeakMap()

/**
 * Event emitter promise queue.
 *
 * Queues events from a Node.js [Event Emitter][1].
 *
 * [1]: https://nodejs.org/dist/latest/docs/api/events.html
 */
class NodeEventPromiseQueue extends PromiseQueue {
  /**
   * @param {EventEmitter} emitter - Event emitter to queue events from.
   * @param {string} eventName - Name of event to queue.
   * @param {boolean} [watchError=true] - Watch for error events from
   *     `emitter`. Fail queue if error is emitted.
   */
  constructor (emitter, eventName, watchError = true) {
    const priv = {
      emitter,
      eventName,
      add: null,
      fail: null,
      receive: null,
      receiveError: null,
      receiving: true,
      watchError: !!watchError
    }
    super(function exposer (prot) {
      priv.add = prot.add
      priv.fail = prot.fail
    })
    const receive = priv.receive = privm.receive.bind(this)
    emitter.addListener(eventName, receive)
    if (watchError) {
      const receiveError = priv.receiveError = privm.receiveError.bind(this)
      emitter.addListener('error', receiveError)
    }
    privs.set(this, priv)
    if (new.target === NodeEventPromiseQueue) Object.freeze(this)
  }

  /**
   * Stop listening for events.
   *
   * No effect if already stopped.
   */
  stop () {
    const priv = privs.get(this)
    if (!priv.receiving) return
    priv.receiving = false
    priv.emitter.removeListener(priv.eventName, priv.receive)
    if (priv.watchError) {
      priv.emitter.removeListener('error', priv.receiveError)
    }
    priv.emitter = null
    priv.receive = null
    priv.receiveError = null
    priv.add = null
    priv.fail = null
  }
}

Object.freeze(NodeEventPromiseQueue)
Object.freeze(NodeEventPromiseQueue.prototype)

// Private methods
const privm = {
  /**
   * Receive event.
   *
   * Adds `Array` containing event data to queue.
   * No effect if stopped or errored.
   *
   * @param {...*} data - Event data.
   */
  receive (...data) {
    const priv = privs.get(this)
    if (!priv.receiving) return
    priv.add(data)
  },

  /**
   * Receive error event.
   *
   * Fails queue.
   * No effect if stopped or already errored.
   *
   * @param {Error} error - Encountered error.
   */
  receiveError (error) {
    const priv = privs.get(this)
    if (!priv.receiving) return
    priv.receiving = false
    priv.emitter.removeListener(priv.eventName, priv.receive)
    priv.emitter.removeListener('error', priv.receiveError)
    priv.fail(error)
    priv.emitter = null
    priv.receive = null
    priv.receiveError = null
    priv.add = null
  }
}

module.exports = NodeEventPromiseQueue
