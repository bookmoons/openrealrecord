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
   * @param {StopSender} prot.stopSender - Stop message sender.
   * @param {ModuleRelayExposer} exposer - Exposer of protected components.
   */
  constructor ({ stopSender }, exposer) {
    const priv = {
      stopSender,
      doneSender: null,
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
    function doneSender () { priv.resolve.done() }
    priv.doneSender = doneSender
    exposer({ doneSender })
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
    await priv.stopSender()
  }
}

Object.freeze(ModuleRelay)

/**
 * Send done message.
 *
 * Delivers done message from controller to relay.
 *
 * @callback DoneSender
 */

/**
 * Send stop message.
 *
 * Delivers stop message to controller.
 * Returns after run has stopped.
 *
 * @callback StopSender
 * @async
 */

/**
 * Expose module relay protected components.
 *
 * @callback ModuleRelayExposer
 *
 * @param {object} prot - Protected components exposed by relay.
 * @param {DoneSender} prot.doneSender - Send done message.
 */

module.exports = ModuleRelay
