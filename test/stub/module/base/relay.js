const sinon = require('sinon')

const instances = []

class StubModuleRelay {
  constructor ({ deliverStop }, exposer) {
    instances.push(this)
    this.deliverStop = sinon.spy(deliverStop)
    this.promise = { done: null }
    this.resolve = { done: null }
    this.reject = { done: null }
    const donePromise = new Promise((resolve, reject) => {
      this.resolve.done = resolve
      this.reject.done = reject
    })
    this.getter = {
      done: sinon.stub().returns(donePromise)
    }
    Object.defineProperty(this, 'done', { get: this.getter.done })
    this.stop = sinon.stub()
    const deliverDone = this.deliverDone = sinon.stub()
    Object.freeze(this)
    exposer({ deliverDone })
  }

  static get instances () { return instances }
}

Object.freeze(StubModuleRelay)
Object.freeze(StubModuleRelay.prototype)

module.exports = StubModuleRelay
