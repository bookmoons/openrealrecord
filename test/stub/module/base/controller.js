const sinon = require('sinon')
const StubModuleRelay = require('./relay')

const instances = []

class StubModuleController {
  constructor (...args) {
    this.args = args
    this.stream = args[0]
    const exposer = this.exposer = args[1]
    instances.push(this)
    const self = this
    this.done = sinon.stub()
    this.write = sinon.stub()
    this.getter = { stop: sinon.stub() }
    Object.defineProperty(this, 'stop', { get: this.getter.stop })
    const receiveStop = this.receiveStop = sinon.stub()
    const relay = this.relay = new StubModuleRelay(
      { deliverStop: receiveStop },
      function receiveRelayProtected ({ deliverDone }) {
        self.deliverDone = deliverDone
      }
    )
    Object.freeze(this)
    exposer({ relay })
  }

  static get instances () { return instances }
}

Object.freeze(StubModuleController)
Object.freeze(StubModuleController.prototype)

module.exports = StubModuleController
