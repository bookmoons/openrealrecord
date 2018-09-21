const tape = require('tape')
const sinon = require('sinon')
const dummyFunction = require('dummy/function')
const ModuleRelay = require('module/base/relay')

tape('construct', t => {
  const prot = { sendStop: dummyFunction }
  const exposer = sinon.spy()
  new ModuleRelay(prot, exposer) /* eslint-disable-line no-new */
  t.true(exposer.calledOnce, 'exposer called')
  t.end()
})

tape('expose', t => {
  const prot = { sendStop: dummyFunction }
  /* eslint-disable-next-line no-new */
  new ModuleRelay(
    prot,
    function receiveRelayProtected ({ receiveDone }) {
      t.is(typeof receiveDone, 'function', 'done sender exposed')
    }
  )
  t.end()
})

tape('stop', t => {
  const prot = { sendStop: sinon.spy() }
  const exposer = sinon.fake()
  const relay = new ModuleRelay(prot, exposer)
  relay.stop()
  t.true(prot.sendStop.calledOnce, 'stop sender called')
  t.end()
})

tape('done', t => {
  const prot = { sendStop: dummyFunction }
  let receiveDone
  const relay = new ModuleRelay(
    prot,
    function receiveRelayProtected (prot) {
      receiveDone = prot.receiveDone
    }
  )
  relay.done.then(() => {
    t.pass('done delivered')
    t.end()
  })
  receiveDone()
})
