/**
 * Bitcoin connector.
 *
 * Provides interface with the [bitcoin][1] chain and network.
 *
 * @interface IBitcoinConnector
 * @memberof module:openrealrecord/connector/bitcoin
 */

/**
 * Publish checkpoint to chain.
 *
 * @method publishCheckpoint
 * @memberof module:openrealrecord/connector/bitcoin~IBitcoinConnector
 * @async
 *
 * @param {Checkpoint} checkpoint - Checkpoint to publish.
 *
 * @return {TXID} Identifier of transaction containing publication.
 *     Transaction confirmation not guaranteed.
 *
 * @throws {Error} If node is not available. Message `'node unavailable'`.
 */

/**
 * Await transaction confirmation.
 *
 * @method transactionConfirmed
 * @memberof module:openrealrecord/connector/bitcoin~IBitcoinConnector
 * @async
 *
 * @param {TXID} txid - Transaction to wait for confirmation of.
 * @param {number} [confirmations=1] - Number of confirmations to await.
 * @param {number} [timeout=900000] - Maximum time to wait in milliseconds.
 *     Default 15 minutes.
 *
 * @throws {Error} If node is not available. Message `'node unavailable'`.
 * @throws {Error} If timeout expires. Message `'timeout'`.
 */

/**
 * Transaction identifier.
 *
 * SHA-256d hash of transaction.
 *
 * @typedef {Buffer} TXID
 * @memberof module:openrealrecord/connector/bitcoin~IBitcoinConnector
 */
