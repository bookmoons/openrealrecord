const tape = require('tape')
const sinon = require('sinon')
const dummyFunction = require('dummy/function')
const ModuleRelay = require('module/base/relay')

tape('construct', t => {
  const prot = { deliverStop: dummyFunction }
  const exposer = sinon.spy()
  new ModuleRelay(prot, exposer) /* eslint-disable-line no-new */
  t.true(exposer.calledOnce, 'exposer called')
  t.end()
})

tape('expose', t => {
  const prot = { deliverStop: dummyFunction }
  /* eslint-disable-next-line no-new */
  new ModuleRelay(
    prot,
    function receiveRelayProtected ({ deliverDone }) {
      t.is(typeof deliverDone, 'function', 'done sender exposed')
    }
  )
  t.end()
})

tape('stop', t => {
  const prot = { deliverStop: sinon.spy() }
  const exposer = sinon.fake()
  const relay = new ModuleRelay(prot, exposer)
  relay.stop()
  t.true(prot.deliverStop.calledOnce, 'stop sender called')
  t.end()
})

tape('done', t => {
  const prot = { deliverStop: dummyFunction }
  let deliverDone
  const relay = new ModuleRelay(
    prot,
    function receiveRelayProtected (prot) {
      deliverDone = prot.deliverDone
    }
  )
  relay.done.then(() => {
    t.pass('done delivered')
    t.end()
  })
  deliverDone()
})
