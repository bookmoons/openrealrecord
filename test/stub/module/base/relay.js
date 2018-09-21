const sinon = require('sinon')

class StubModuleRelay {
  constructor ({ deliverStop }, exposer) {
    this.deliverStop = sinon.spy(deliverStop)
    this.done = sinon.stub()
    this.stop = sinon.stub()
    const deliverDone = this.deliverDone = sinon.stub()
    Object.freeze(this)
    exposer({ deliverDone })
  }
}

Object.freeze(StubModuleRelay)
Object.freeze(StubModuleRelay.prototype)

module.exports = StubModuleRelay
