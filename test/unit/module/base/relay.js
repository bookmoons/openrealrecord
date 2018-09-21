const tape = require('tape')
const sinon = require('sinon')
const dummyFunction = require('dummy/function')
const ModuleRelay = require('module/base/relay')

tape('construct', t => {
  const prot = { stopSender: dummyFunction }
  const exposer = sinon.spy()
  new ModuleRelay(prot, exposer) /* eslint-disable-line no-new */
  t.true(exposer.calledOnce, 'exposer called')
  t.end()
})

tape('expose', t => {
  const prot = { stopSender: dummyFunction }
  /* eslint-disable-next-line no-new */
  new ModuleRelay(
    prot,
    function receiveRelayProtected ({ doneSender }) {
      t.is(typeof doneSender, 'function', 'done sender exposed')
    }
  )
  t.end()
})

tape('stop', t => {
  const prot = { stopSender: sinon.spy() }
  const exposer = sinon.fake()
  const relay = new ModuleRelay(prot, exposer)
  relay.stop().then(() => {
    t.true(prot.stopSender.calledOnce, 'stop sender called')
    t.end()
  })
})

tape('done', t => {
  const prot = { stopSender: dummyFunction }
  let doneSender
  const relay = new ModuleRelay(
    prot,
    function receiveRelayProtected (prot) {
      doneSender = prot.doneSender
    }
  )
  relay.done.then(() => {
    t.pass('done delivered')
    t.end()
  })
  doneSender()
})
