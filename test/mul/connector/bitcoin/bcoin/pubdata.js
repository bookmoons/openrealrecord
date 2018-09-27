const test = require('ava')
const bcoin = require('bcoin')
const Delay = require('helper/delay')
const BcoinBitcoinBlockchainFixture =
  require('fixture/blockchain/bitcoin/bcoin')
const StaticBitcoinFeeProvider = require('provider/bitcoin/fee/static')
const BcoinBitcoinConnector = require('connector/bitcoin/bcoin')

const regtest = bcoin.Network.get('regtest')
const feeRate = 1000000 // 0.01 BTC

test.beforeEach(async t => {
  const blockchain = new BcoinBitcoinBlockchainFixture()
  await blockchain.setup()
  t.context.blockchain = blockchain
  const feeProvider = new StaticBitcoinFeeProvider(feeRate)
  const connector = new BcoinBitcoinConnector({
    network: regtest,
    feeProvider,
    wallet: {
      apiKey: blockchain.walletNodeApiKey,
      id: blockchain.walletId,
      passphrase: blockchain.walletPassphrase,
      account: blockchain.walletAccount
    }
  })
  t.context.connector = connector
})

test.afterEach(async t => {
  if (t.context.blockchain) await t.context.blockchain.teardown()
})

test.serial('too much data', async t => {
  const { connector } = t.context
  const data = Buffer.alloc(41)
  const publishDataPromise = connector.publishData(data)
  await t.throwsAsync(
    publishDataPromise,
    'too much data',
    'too much data fails'
  )
})

test.serial('success', async t => {
  const { blockchain, connector } = t.context
  const data = Buffer.from([ 0x01, 0x02, 0x03 ])
  const txid = await connector.publishData(data)
  t.is(typeof txid, 'string')
  t.is(txid.length, 64)
  t.regex(txid, /[0-9a-fA-F]{2}/g) // Hexadecimal string
  const confirmedPromise = new Promise((resolve, reject) => {
    function handleTimeout () {
      blockchain.chainNode.removeListener('block', checkBlockForTx)
      reject(new Error('timed out'))
    }
    function checkBlockForTx (block) {
      if (block.txs.length < 2) return
      for (const tx of block.txs) {
        if (tx.txid() === txid) {
          blockchain.chainNode.removeListener('block', checkBlockForTx)
          resolve(tx)
          return
        }
      }
    }
    Delay.seconds(1).then(handleTimeout)
    blockchain.chainNode.on('block', checkBlockForTx)
  })
  await blockchain.chainNodeClient.execute('generate', [ 1 ])
  await t.notThrowsAsync(confirmedPromise, 'tx published')
  const tx = await confirmedPromise
  const output = (function extractOutput () {
    for (const output of tx.outputs) {
      if (output.getType() === 'nulldata') return output
      return null
    }
  })()
  t.truthy(output, 'tx has data')
  const script = output.script
  const code = script.code
  t.is(code[0].value, 106, 'op_return output')
  t.deepEqual(
    code[1].data,
    Buffer.from([ 0x01, 0x02, 0x03 ]),
    'correct data published'
  )
})
