/** @module openrealrecord/module/base/controller */

const ModuleControllerPromises = require('./promises')
const ModuleRelay = require('./relay')
const { StopSignal } = require('../../signal')

const privs = new WeakMap()

/**
 * Module controller.
 *
 * Provided to module executor.
 * Exposes execution functionality and messages to and from module.
 */
class ModuleController {
  /**
   * @param {Stream} stream - Stream to write to.
   * @param {ModuleControllerExposer} exposer - Exposer of protected
   *     components.
   */
  constructor (stream, exposer) {
    const priv = {
      stream,
      stop: false,
      promise: {
        stop: null
      },
      resolve: {
        stop: null
      },
      promises: null,
      deliverDone: null
    }
    privs.set(this, priv)
    priv.promise.stop = new Promise(resolve => { priv.resolve.stop = resolve })
    priv.promises = new ModuleControllerPromises({ stop: priv.promise.stop })
    const deliverStop = privm.receiveStop.bind(this)
    const relay = new ModuleRelay(
      { deliverStop },
      function receiveRelayProtected ({ deliverDone }) {
        priv.deliverDone = deliverDone
      }
    )
    if (new.target === ModuleController) Object.freeze(this)
    exposer({ relay })
  }

  /**
   * Deliver done message to relay.
   */
  done () {
    const priv = privs.get(this)
    priv.deliverDone()
  }

  /**
   * Promises collection.
   *
   * @var {object}
   * @readonly
   *
   * @prop {Promise} stop - Promise for stop request received. Resolves with
   *     `StopSignal`. May `Promise.race` with external promises to interrupt
   *     the wait when stop is requested.
   */
  get promise () {
    const priv = privs.get(this)
    return priv.promises
  }

  /**
   * Stop flag.
   *
   * Indicates whether stop message has been received.
   * Check periodically to detect stop requests.
   *
   * @var {boolean}
   * @readonly
   */
  get stop () {
    const priv = privs.get(this)
    return priv.stop
  }

  /**
   * Write bytes to stream.
   *
   * @param {Buffer} bytes - Data to write.
   */
  async write (bytes) {
    const priv = privs.get(this)
    const stream = priv.stream
    await new Promise(function writeToStream (resolve, reject) {
      stream.write(bytes, function handleStreamWriteDone (error) {
        if (error) reject(error)
        else resolve()
      })
    })
  }
}

Object.freeze(ModuleController)
Object.freeze(ModuleController.prototype)

// Private methods
const privm = {
  /**
   * Receive stop message from relay.
   *
   * @implements {DeliverStop}
   */
  async receiveStop () {
    const priv = privs.get(this)
    priv.stop = true
    const stopSignal = new StopSignal('module')
    priv.resolve.stop(stopSignal)
  }
}

/**
 * Expose module controller protected components.
 *
 * @callback ModuleControllerExposer
 *
 * @param {object} prot - Protected components exposed by controller.
 * @param {ModuleRelay} prot.relay - Entangled module relay.
 */

module.exports = ModuleController
