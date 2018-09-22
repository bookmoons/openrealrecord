const tape = require('tape')
const sinon = require('sinon')
const mockRequire = require('mock-require')
const Delay = require('helper/delay')
const DummyStream = require('stub/stream')
const StubModuleController = require('stub/module/base/controller')

mockRequire('module/base/controller', StubModuleController)

const Module = require('module/base/main')

tape('construct', t => {
  const stream = new DummyStream()
  const executor = sinon.spy()
  t.doesNotThrow(() => {
    new Module(stream, executor) /* eslint-disable-line no-new */
  }, 'constructed')
  t.end()
})

tape('start', t => {
  const stream = new DummyStream()
  const executor = sinon.spy(async function executor () {})
  const module = new Module(stream, executor)
  module.start()
  t.true(executor.calledOnce, 'launched executor')
  t.end()
})

tape('stop', t => {
  const stream = new DummyStream()
  const module = new Module(stream, async function executor (controller) {
    controller.getter.stop.returns(false).onThirdCall().returns(true)
    for (let i = 0; i < 100; i++) {
      await Delay.milliseconds(10)
      if (controller.stop) {
        t.pass('received stop')
        return
      }
    }
    t.fail('never received stop')
  })
  module.start()
  module.stop().then(function handleModuleStopped () {
    t.end()
  })
})

tape('restart', t => {
  const stream = new DummyStream()
  const executor = sinon.spy(async function executor (controller) {
    controller.getter.stop.returns(false).onThirdCall().returns(true)
    for (let i = 0; i < 100; i++) {
      await Delay.milliseconds(1)
      if (controller.stop) return
    }
  })
  const module = new Module(stream, executor)
  module.start()
  module.stop().then(function handleModuleStopped () {
    module.start()
    t.true(executor.calledTwice, 'relaunched executor')
    t.end()
  })
})

tape('done', t => {
  const stream = new DummyStream()
  const module = new Module(stream, async function executor (controller) {
    controller.relay.resolve.done()
    controller.done()
  })
  module.done.then(function handleModuleDone () {
    t.pass('received done')
    t.end()
  })
  module.start()
})

tape('error', t => {
  const stream = new DummyStream()
  const module = new Module(stream, async function executor () {
    throw new Error('executor failed')
  })
  module.done.catch(function handleModuleError () {
    t.pass('received error')
    t.end()
  })
  module.start()
})
