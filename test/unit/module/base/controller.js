const test = require('ava')
const sinon = require('sinon')
const mockRequire = require('mock-require')
const StubStream = require('stub/stream')

const StubModuleControllerPromises = require('stub/module/base/promises')
const StubModuleRelay = require('stub/module/base/relay')
mockRequire('module/base/promises', StubModuleControllerPromises)
mockRequire('module/base/relay', StubModuleRelay)

const ModuleController = require('module/base/controller')

test('construct', t => {
  const stream = new StubStream()
  const exposer = sinon.spy()
  new ModuleController(stream, exposer) /* eslint-disable-line no-new */
  t.true(exposer.calledOnce, 'exposer called')
})

test('expose', t => {
  const stream = new StubStream()
  /* eslint-disable-next-line no-new */
  new ModuleController(
    stream,
    function receiveControllerProtected ({ relay }) {
      t.true(relay instanceof StubModuleRelay, 'relay exposed')
    }
  )
})

test('write', async t => {
  const stream = new StubStream()
  stream.write.callsArgAsync(1)
  const exposer = sinon.fake()
  const controller = new ModuleController(stream, exposer)
  await controller.write(Buffer.alloc(0))
  t.true(stream.write.calledOnce, 'write successful')
})

test('write fail', async t => {
  const stream = new StubStream()
  stream.write.callsArgWithAsync(1, new Error('write failed'))
  const exposer = sinon.fake()
  const controller = new ModuleController(stream, exposer)
  const writePromise = controller.write(Buffer.alloc(0))
  await t.throwsAsync(writePromise, null, 'write error delivered')
})

test('done', t => {
  const stream = new StubStream()
  let relay
  const controller = new ModuleController(
    stream,
    function receiveControllerProtected (prot) {
      relay = prot.relay
    }
  )
  controller.done()
  t.true(relay.deliverDone.calledOnce, 'done delivered')
})

test('stop', t => {
  const stream = new StubStream()
  let deliverStop
  const controller = new ModuleController(
    stream,
    function receiveControllerProtected ({ relay }) {
      deliverStop = relay.deliverStop
    }
  )
  t.false(controller.stop, 'stop initially clear')
  deliverStop()
  t.true(controller.stop, 'stop delivered')
})

test('stop promise', async t => {
  const stream = new StubStream()
  let deliverStop
  const controller = new ModuleController(
    stream,
    function receiveControllerProtected ({ relay }) {
      deliverStop = relay.deliverStop
    }
  )
  t.false(controller.stop, 'stop initially clear')
  const stopPromise = controller.promise.args[0].stop
  deliverStop()
  await t.notThrowsAsync(stopPromise, 'stop promise resolved')
})
