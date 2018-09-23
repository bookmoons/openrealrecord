const test = require('ava')
const sinon = require('sinon')
const PromiseQueue = require('queue/promise/base')

test('construct', t => {
  const exposer = sinon.fake()
  t.notThrows(() => {
    new PromiseQueue(exposer) /* eslint-disable-line no-new */
  }, 'constructed')
})

test('expose', t => {
  /* eslint-disable-next-line no-new */
  new PromiseQueue(function exposer (prot) {
    t.is(typeof prot.add, 'function', 'add exposed')
  })
})

test('queue value', t => {
  /* eslint-disable-next-line no-new */
  new PromiseQueue(function exposer ({ add }) {
    t.notThrows(add, 'queued value')
  })
})

test('queue request', t => {
  const exposer = sinon.fake()
  const queue = new PromiseQueue(exposer)
  t.notThrows(() => {
    queue.next /* eslint-disable-line no-unused-expressions */
  }, 'queued request')
})

test('add then request', async t => {
  const queue = new PromiseQueue(function exposer ({ add }) {
    add(57)
  })
  const value = await queue.next
  t.is(value, 57)
})

test('request then add', async t => {
  let add
  const queue = new PromiseQueue(function exposer (prot) {
    add = prot.add
  })
  const nextPromise = queue.next
  add(57)
  const value = await nextPromise
  t.is(value, 57)
})

test('queued values', async t => {
  const queue = new PromiseQueue(function exposer ({ add }) {
    add(57)
    add(58)
    add(59)
  })
  t.is(await queue.next, 57)
  t.is(await queue.next, 58)
  t.is(await queue.next, 59)
})

test('queued requests', async t => {
  let add
  const queue = new PromiseQueue(function exposer (prot) {
    add = prot.add
  })
  const first = queue.next
  const second = queue.next
  const third = queue.next
  add(57)
  add(58)
  add(59)
  t.is(await first, 57)
  t.is(await second, 58)
  t.is(await third, 59)
})
