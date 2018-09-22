const test = require('ava')
const mockRequire = require('mock-require')
const DummyStream = require('dummy/stream')
const StubModuleController = require('stub/module/base/controller')
const StubModuleRelay = require('stub/module/base/relay')

mockRequire('module/base/controller', StubModuleController)

const IterableModule = require('module/iterable')

test('construct', t => {
  const stream = new DummyStream()
  const data = []
  t.notThrows(() => {
    new IterableModule(stream, data) /* eslint-disable-line no-new */
  })
})

test.cb('write', t => {
  const stream = new DummyStream()
  const data = [
    Buffer.from([ 1 ]),
    Buffer.from([ 2 ]),
    Buffer.from([ 3 ])
  ]
  const module = new IterableModule(stream, data)
  module.start()
  const controller = StubModuleController.instances.pop()
  controller.done.callsFake(() => { controller.deliverDone() })
  const relay = StubModuleRelay.instances.pop()
  relay.deliverDone.callsFake(() => { relay.resolve.done() })
  module.done.then(function handleModuleDone () {
    const write = controller.write
    t.true(write.calledThrice)
    t.deepEqual(write.firstCall.args[0], Buffer.from([ 1 ]))
    t.deepEqual(write.secondCall.args[0], Buffer.from([ 2 ]))
    t.deepEqual(write.thirdCall.args[0], Buffer.from([ 3 ]))
    t.end()
  })
})
