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
   * @param {DeliverStop} prot.sendStop - Stop message sender.
   * @param {ModuleRelayExposer} exposer - Exposer of protected components.
   */
  constructor ({ sendStop }, exposer) {
    const priv = {
      sendStop,
      receiveDone: null,
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
    const receiveDone = privm.receiveDone.bind(this)
    priv.receiveDone = receiveDone
    exposer({ receiveDone })
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
  async stop () {
    const priv = privs.get(this)
    await priv.sendStop()
  }
}

Object.freeze(ModuleRelay)

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
 * @param {DeliverDone} prot.receiveDone - Receive done message.
 */

module.exports = ModuleRelay
