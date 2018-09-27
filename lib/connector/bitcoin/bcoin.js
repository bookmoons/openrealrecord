/** @module openrealrecord/connector/bitcoin/bcoin */

const bcoin = require('bcoin')
const { WalletClient } = require('bclient')

const mainnet = bcoin.Network.get('main')

const privs = new WeakMap()

/**
 * [`bcoin`][1] based bitcoin connector.
 *
 * [1]: http://bcoin.io/
 *
 * @implements {IBitcoinConnector}
 */
class BcoinBitcoinConnector {
  /**
   * @param {BcoinBitcoinConnectorParams} params
   */
  constructor ({
    network = mainnet,
    feeProvider,
    wallet: {
      host: walletHost = 'localhost',
      port: walletPort = network.walletPort,
      apiKey: walletApiKey = null,
      id: walletId = 'primary',
      passphrase: walletPassphrase = null,
      account: walletAccount = 'default'
    } = {}
  }) {
    const priv = {
      network,
      feeProvider,
      wallet: {
        client: null,
        passphrase: walletPassphrase,
        account: walletAccount
      }
    }
    privs.set(this, priv)
    const walletNodeClient = new WalletClient({
      host: walletHost,
      port: walletPort,
      apiKey: walletApiKey
    })
    priv.wallet.client = walletNodeClient.wallet(walletId)
    if (new.target === BcoinBitcoinConnector) Object.freeze(this)
  }

  async publishData (data) {
    if (data.length > 40) throw new Error('too much data')
    const priv = privs.get(this)
    const feeRate = await priv.feeProvider.rate
    const script = bcoin.Script.fromNulldata(data)
    const output = bcoin.Output.fromScript(script, 0)
    const { hash: txid } = await priv.wallet.client.send({
      passphrase: priv.wallet.passphrase,
      account: priv.wallet.account,
      rate: feeRate,
      outputs: [ output ]
    })
    return txid
  }
}

Object.freeze(BcoinBitcoinConnector)
Object.freeze(BcoinBitcoinConnector.prototype)

/**
 * Connector parameters.
 *
 * TODO: Add maxFee.
 *
 * @typedef {object} BcoinBitcoinConnectorParams
 *
 * @param {bcoin/protocol.Network} [network=<mainnet>] - Bitcoin network
 *     to interface with. Default mainnet.
 * @param {IBitcoinFeeProvider} feeProvider - Fee rate provider.
 *     Consulted before creating a transaction.
 * @param {WalletDetails} [wallet=] - Wallet details. Use all default options
 *     if not provided.
 */

/**
 * Wallet detail parameters.
 *
 * @typedef {object} WalletDetails
 *
 * @prop {string} [host='localhost'] - Wallet service host.
 * @prop {number} [port=<network-default>] - Port of wallet
 *     connection. Default is the default of the selected network.
 * @prop {string} [apiKey=] - Wallet service API key.
 * @prop {string} [id='primary'] - Wallet identifier.
 * @prop {string} [passphrase=] - Wallet passphrase.
 * @prop {string} [account='default'] - Account name.
 */

module.exports = BcoinBitcoinConnector
