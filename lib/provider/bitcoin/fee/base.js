/** @module openrealrecord/provider/bitcoin/fee/base */

/**
 * Bitcoin fee provider.
 *
 * @implements {IBitcoinFeeProvider}
 * @abstract
 */
class BitcoinFeeProvider {
  constructor () {
    throw new Error('constructed abstract class')
  }

  /** @abstract */
  get rate () {
    throw new Error('accessed abstract property')
  }
}

Object.freeze(BitcoinFeeProvider)
Object.freeze(BitcoinFeeProvider.prototype)

module.exports = BitcoinFeeProvider
