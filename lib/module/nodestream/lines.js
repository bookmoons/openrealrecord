const { NodeEventPromiseQueue } = require('../../queue/promise')
const { StopSignal } = require('../../signal')
const Module = require('../base')

const privs = new WeakMap()

/**
 * Feed lines from a Node.js `Readable` to a stream.
 */
class LinesNodeStreamModule extends Module {
  /**
   * @param {Stream} stream - Stream to feed data to.
   * @param {Readable<Buffer>} source - Data source.
   */
  constructor (stream, source) {
    super(stream, executor)
    const self = this
    function executor (...args) { return privm.executor.call(self, ...args) }
    const priv = {
      stream,
      source
    }
    privs.set(this, priv)
    if (new.target === LinesNodeStreamModule) Object.freeze(this)
  }
}

// Private methods
const privm = {
  /** Module executor. */
  async executor (controller) {
    const priv = privs.get(this)
    const source = priv.source
    const queue = new NodeEventPromiseQueue(source, 'data')
    source.resume()
    try {
      await privm.iterateData.call(this, controller, queue)
    } finally { queue.stop() }
  },

  /**
   * Iterate data from source.
   *
   * Buffers received chunks.
   * Processes buffer after each chunk.
   */
  async iterateData (controller, queue) {
    let buffer = Buffer.alloc(0)
    while (!controller.stop) {
      const received = await Promise.race([
        queue.next,
        controller.promise.stop
      ])
      if (received instanceof StopSignal) return
      const chunk = received[0]
      buffer = Buffer.concat([ buffer, chunk ])
      buffer = await privm.processBuffer.call(this, controller, buffer)
    }
  },

  /**
   * Process buffered data from source.
   *
   * Writes all lines to stream.
   */
  async processBuffer (controller, buffer) {
    while (true) {
      const lineBreakIndex = buffer.indexOf(Buffer.from('\n', 'utf8'))
      if (lineBreakIndex === -1) return buffer
      const line = buffer.slice(0, lineBreakIndex)
      console.log(line)
      await controller.write(line)
      buffer = buffer.slice(lineBreakIndex + 1)
      if (!buffer.length) return buffer
    }
  }
}

module.exports = LinesNodeStreamModule
