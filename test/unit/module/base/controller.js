const tape = require('tape')
const sinon = require('sinon')
const mockRequire = require('mock-require')
const StubStream = require('stub/stream')

const StubModuleRelay = require('stub/module/base/relay')
mockRequire('module/base/relay', StubModuleRelay)

const ModuleController = require('module/base/controller')

tape('construct', t => {
  const stream = new StubStream()
  const exposer = sinon.spy()
  new ModuleController(stream, exposer) /* eslint-disable-line no-new */
  t.true(exposer.calledOnce, 'exposer called')
  t.end()
})

tape('expose', t => {
  const stream = new StubStream()
  /* eslint-disable-next-line no-new */
  new ModuleController(
    stream,
    function receiveControllerProtected ({ relay }) {
      t.true(relay instanceof StubModuleRelay, 'relay exposed')
      t.end()
    }
  )
})

tape('write', t => {
  const stream = new StubStream()
  stream.write.callsArgAsync(1)
  const exposer = sinon.fake()
  const controller = new ModuleController(stream, exposer)
  controller.write(Buffer.alloc(0))
    .then(function handleWriteDone () {
      t.pass('write successful')
      t.end()
    })
    .catch(function handleWriteFailed (error) {
      t.error(error)
    })
})

tape('write fail', t => {
  const stream = new StubStream()
  stream.write.callsArgWithAsync(1, new Error('write failed'))
  const exposer = sinon.fake()
  const controller = new ModuleController(stream, exposer)
  controller.write(Buffer.alloc(0))
    .then(function handleWriteDone () {
      t.fail('incorrect success')
    })
    .catch(function handleWriteFailed (error) {
      t.ok(error, 'write failed')
      t.end()
    })
})

tape('done', t => {
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
  t.end()
})

tape('stop', t => {
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
  t.end()
})
