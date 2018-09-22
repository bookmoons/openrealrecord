const Module = require('./base')

const privs = new WeakMap()

class IterableModule extends Module {
  /**
   * @param {Iterable<Buffer>} iterable - Data to feed to stream.
   */
  constructor (stream, iterable) {
    super(stream, executor)
    const self = this
    function executor (...args) { return privm.executor.call(self, ...args) }
    function * relayer () { yield * iterable }
    const iterator = relayer() // Ensures resumable iterator
    const priv = {
      iterator
    }
    privs.set(this, priv)
    if (new.target === IterableModule) Object.freeze(this)
  }
}

// Private methods
const privm = {
  /**
   * Module executor.
   *
   * Writes each item of provided iterable to stream.
   */
  async executor (controller) {
    const priv = privs.get(this)
    const iterator = priv.iterator
    for (const item of iterator) {
      await controller.write(item)
      if (controller.stop) return
    }
    controller.done()
  }
}

Object.freeze(IterableModule)
Object.freeze(IterableModule.prototype)

module.exports = IterableModule
