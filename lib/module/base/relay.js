/** @module openrealrecord/module/base/relay */

const privs = new WeakMap()

/**
 * Module relay.
 *
 * Maintains connection with a run controller.
 * Relays messages to and from controller.
 */
class ModuleRelay {
  /**
   * @param {object} prot - Protected components exposed to relay.
   * @param {DeliverStop} prot.deliverStop - Deliver stop message.
   * @param {ModuleRelayExposer} exposer - Exposer of protected components.
   */
  constructor ({ deliverStop }, exposer) {
    const priv = {
      deliverStop,
      promise: {
        done: null
      },
      resolve: {
        done: null
      }
    }
    privs.set(this, priv)
    priv.promise.done = new Promise(resolve => {
      priv.resolve.done = resolve
    })
    const deliverDone = privm.receiveDone.bind(this)
    Object.freeze(this)
    exposer({ deliverDone })
  }

  /**
   * Promise for done.
   *
   * Resolves when the done message has been received.
   * No resolution value.
   *
   * @var {Promise}
   * @readonly
   */
  get done () {
    const priv = privs.get(this)
    return priv.promise.done
  }

  /**
   * Deliver stop message to controller.
   */
  stop () {
    const priv = privs.get(this)
    priv.deliverStop()
  }
}

Object.freeze(ModuleRelay)
Object.freeze(ModuleRelay.prototype)

// Private methods
const privm = {
  /**
   * Receive done message from controller.
   *
   * Resolves done promise exposed by relay.
   *
   * @implements {DeliverDone}
   */
  receiveDone () {
    const priv = privs.get(this)
    priv.resolve.done()
  }
}

/**
 * Expose module relay protected components.
 *
 * @callback ModuleRelayExposer
 *
 * @param {object} prot - Protected components exposed by relay.
 * @param {DeliverDone} prot.deliverDone - Deliver done message.
 */

module.exports = ModuleRelay
