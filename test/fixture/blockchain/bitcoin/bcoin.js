const bcoin = require('bcoin')
const { NodeClient, WalletClient } = require('bclient')

const regtest = bcoin.Network.get('regtest')

const privs = new WeakMap()

/**
 * `bcoin` based bitcoin blockchain fixture.
 *
 * Sets up an in memory `regtest` chain.
 *
 * Creates these components:
 *
 * - A single chain node.
 * - A chain client connected to the chain node.
 * - A wallet node connected to the chain node.
 * - A wallet client connected to the wallet node.
 *
 * Sets up with this configuration:
 *
 * - Wallet node has 1 wallet created.
 * - Wallet has 1 account created.
 * - Account has 1 receiving address created.
 */
class BcoinBitcoinBlockchainFixture {
  constructor () {
    const priv = {
      chainNode: null,
      chainNodeClient: null,
      walletNode: null,
      walletNodeClient: null,
      walletToken: null,
      walletClient: null,
      address: null
    }
    privs.set(this, priv)
  }

  /**
   * Setup fixture.
   */
  async setup () {
    const priv = privs.get(this)
    const {
      node: chainNode
    } = await privm.createChainNode.call(this)
    const {
      client: chainNodeClient
    } = await privm.createChainNodeClient.call(this)
    const {
      node: walletNode
    } = await privm.createWalletNode.call(this)
    const {
      client: walletNodeClient
    } = privm.createWalletNodeClient.call(this)
    const walletDetails = await walletNodeClient.createWallet(
      this.walletId,
      { passphrase: this.passphrase }
    )
    const walletClient = walletNodeClient.wallet(this.walletId)
    await walletClient.createAccount(
      this.walletAccount,
      { name: this.walletAccount, passphrase: this.passphrase }
    )
    const { address } = await walletClient.createAddress(
      this.walletAccount
    )
    Object.assign(priv, {
      chainNode,
      chainNodeClient,
      walletNode,
      walletNodeClient,
      walletToken: walletDetails.token,
      walletClient,
      address
    })
  }

  /**
   * Mine coins into generated address.
   *
   * TODO: Mine less and await propagation.
   *
   * @param {number} [blocksCount=300] - Number of blocks to mine.
   */
  async mine (blocksCount = 300) {
    const priv = privs.get(this)
    const { address, chainNode, chainNodeClient } = priv
    chainNode.miner.addresses.push(address)
    await chainNodeClient.execute('generate', [ blocksCount ])
  }

  /**
   * Teardown fixture.
   */
  async teardown () {
    const priv = privs.get(this)
    priv.chainClient = null
    await this.destroyChainNode()
    priv.chainNode = null
    priv.walletClient = null
    await this.destroyWalletNode()
    priv.walletNode = null
    priv.walletToken = null
  }

  /**
   * Destroy chain node.
   *
   * No effect if fixture is inactive.
   * No effect if chain node is inactive.
   */
  async destroyChainNode () {
    const priv = privs.get(this)
    const chainNode = priv.chainNode
    if (!chainNode) return
    if (chainNode.pool.connected) await chainNode.disconnect()
    if (chainNode.opened) await chainNode.close()
  }

  /**
   * Destroy wallet node.
   *
   * No effect if fixture is inactive.
   * No effect if wallet node is inactive.
   */
  async destroyWalletNode () {
    const priv = privs.get(this)
    const walletNode = priv.walletNode
    if (!walletNode) return
    if (walletNode.opened) await walletNode.close()
  }

  /**
   * API key for chain node.
   *
   * @constant {string}
   * @default 'ChainNodeApiKey'
   */
  get chainNodeApiKey () { return 'ChainNodeApiKey' }

  /**
   * API key for wallet node.
   *
   * @constant {string}
   * @default 'WalletNodeApiKey'
   */
  get walletNodeApiKey () { return 'WalletNodeApiKey' }

  /**
   * Identifier of created wallet.
   *
   * @constant {string}
   * @default 'WalletId'
   */
  get walletId () { return 'WalletId' }

  /**
   * Passphrase of created wallet.
   *
   * @constant {string}
   * @default 'passphrase'
   */
  get walletPassphrase () { return 'passphrase' }

  /**
   * Name of created account.
   *
   * @constant {string}
   * @default 'AccountName'
   */
  get walletAccount () { return 'AccountName' }

  /**
   * Token of created wallet.
   *
   * `null` if fixture is inactive.
   *
   * @var {string}
   * @readonly
   */
  get walletToken () {
    const priv = privs.get(this)
    return priv.walletToken
  }

  /**
   * Generated receiving address.
   *
   * `null` if fixture is inactive.
   *
   * @var {string}
   * @readonly
   */
  get address () {
    const priv = privs.get(this)
    return priv.address
  }

  /**
   * Chain node.
   *
   * `null` if fixutre is inactive.
   *
   * @var {?bcoin.FullNode}
   * @readonly
   */
  get chainNode () {
    const priv = privs.get(this)
    return priv.chainNode
  }

  /**
   * Chain node client.
   *
   * `null` if fixture is inactive.
   *
   * @var {?bclient.NodeClient}
   * @readonly
   */
  get chainNodeClient () {
    const priv = privs.get(this)
    return priv.chainNodeClient
  }

  /**
   * Wallet node.
   *
   * `null` if fixture is inactive.
   *
   * @var {?bcoin.wallet.Node}
   * @readonly
   */
  get walletNode () {
    const priv = privs.get(this)
    return priv.walletNode
  }

  /**
   * Wallet node client.
   *
   * `null` if fixture is inactive.
   *
   * @var {?bclient.WalletClient}
   * @readonly
   */
  get walletNodeClient () {
    const priv = privs.get(this)
    return priv.walletNodeClient
  }

  /**
   * Wallet client for created wallet.
   *
   * `null` if fixture is inactive.
   *
   * @var {?bclient.Wallet}
   * @readonly
   */
  get walletClient () {
    const priv = privs.get(this)
    return priv.walletClient
  }
}

// Private methods
const privm = {
  /**
   * Create chain node.
   *
   * @return {CreateChainNodeReturn}
   */
  async createChainNode () {
    const node = new bcoin.FullNode({
      network: regtest.type,
      listen: false,
      httpPort: regtest.rpcPort,
      memory: true,
      workers: true,
      logFile: false,
      logConsole: false,
      logLevel: 'debug',
      apiKey: this.chainNodeApiKey,

      // Ignore external configuration
      argv: false,
      env: false,
      query: false,
      hash: false
    })
    await node.open()
    await node.connect()
    return { node }
  },

  /**
   * Create chain node client.
   *
   * Connects to chain node.
   *
   * @return {CreateChainNodeClientReturn}
   */
  createChainNodeClient () {
    const client = new NodeClient({
      network: regtest.type,
      port: regtest.rpcPort,
      apiKey: this.chainNodeApiKey
    })
    return { client }
  },

  /**
   * Create wallet node.
   *
   * Connects to chain node.
   *
   * @return {CreateWalletNodeReturn}
   */
  async createWalletNode () {
    const node = new bcoin.wallet.Node({
      network: regtest.type,
      listen: false,
      rpcPort: regtest.rpcPort,
      httpPort: regtest.walletPort,
      memory: true,
      workers: false,
      logFile: false,
      logConsole: false,
      logLevel: 'debug',
      nodeApiKey: this.chainNodeApiKey,
      apiKey: this.walletNodeApiKey,

      // Ignore external configuration
      argv: false,
      env: false,
      query: false,
      hash: false
    })
    await node.open()
    return { node }
  },

  /**
   * Create wallet node client.
   *
   * Connects to wallet node.
   *
   * @return {CreateWalletNodeClientReturn}
   */
  createWalletNodeClient () {
    const client = new WalletClient({
      network: regtest.type,
      port: regtest.walletPort,
      apiKey: this.walletNodeApiKey
    })
    return { client }
  }
}

/**
 * @typedef {object} CreateChainNodeReturn
 *
 * @prop {bcoin.FullNode} node - Chain node.
 */

/**
 * @typedef {object} CreateChainNodeClientReturn
 *
 * @prop {bclient.NodeClient} client - Chain node client.
 */

/**
 * @typedef {object} CreateWalletNodeReturn
 *
 * @prop {bcoin.wallet.Node} node - Wallet node.
 */

/**
 * @typedef {object} CreateWalletNodeClientReturn
 *
 * @prop {bclient.WalletClient} client - Wallet node client.
 */

module.exports = BcoinBitcoinBlockchainFixture
