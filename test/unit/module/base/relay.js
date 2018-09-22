const test = require('ava')
const sinon = require('sinon')
const dummyFunction = require('dummy/function')
const ModuleRelay = require('module/base/relay')

test('construct', t => {
  const prot = { deliverStop: dummyFunction }
  const exposer = sinon.spy()
  new ModuleRelay(prot, exposer) /* eslint-disable-line no-new */
  t.true(exposer.calledOnce, 'exposer called')
})

test('expose', t => {
  const prot = { deliverStop: dummyFunction }
  /* eslint-disable-next-line no-new */
  new ModuleRelay(
    prot,
    function receiveRelayProtected ({ deliverDone }) {
      t.is(typeof deliverDone, 'function', 'deliver done exposed')
    }
  )
})

test('stop', t => {
  const prot = { deliverStop: sinon.spy() }
  const exposer = sinon.fake()
  const relay = new ModuleRelay(prot, exposer)
  relay.stop()
  t.true(prot.deliverStop.calledOnce, 'deliver stop called')
})

test('done', async t => {
  const prot = { deliverStop: dummyFunction }
  let deliverDone
  const relay = new ModuleRelay(
    prot,
    function receiveRelayProtected (prot) {
      deliverDone = prot.deliverDone
    }
  )
  const done = relay.done
  deliverDone()
  await t.notThrowsAsync(done, 'done delivered')
})
