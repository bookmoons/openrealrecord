const sinon = require('sinon')
const StubModuleRelay = require('./relay')

class StubModuleController {
  constructor (stream, exposer) {
    this.stream = stream
    this.done = sinon.stub()
    this.write = sinon.stub()
    this.getter = { stop: sinon.stub() }
    Object.defineProperty(this, 'stop', { get: this.getter.stop })
    const receiveStop = this.receiveStop = sinon.stub()
    const relay = this.relay = new StubModuleRelay(
      { deliverStop: receiveStop },
      function receiveRelayProtected () {}
    )
    Object.freeze(this)
    exposer({ relay })
  }
}

Object.freeze(StubModuleController)
Object.freeze(StubModuleController.prototype)

module.exports = StubModuleController
