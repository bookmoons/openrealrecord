/** @module openrealrecord/module/base/controller */

const ModuleRelay = require('./relay')

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
      deliverDone: null
    }
    privs.set(this, priv)
    const deliverStop = privm.receiveStop.bind(this)
    const relay = new ModuleRelay(
      { deliverStop },
      function receiveRelayProtected ({ deliverDone }) {
        priv.deliverDone = deliverDone
      }
    )
    Object.freeze(this)
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
