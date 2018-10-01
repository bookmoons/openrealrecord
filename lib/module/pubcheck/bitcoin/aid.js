const hashPrefix = Buffer.from('ORRecord', 'ascii')

const Aid = {
  /**
   * Package checkpoint for publication.
   *
   * @param {object} checkpoint - Checkpoint.
   *
   * @return {Buffer} Packaged message.
   */
  packageCheckpoint (checkpoint) {
    const hash = checkpoint.rootsHash
    const message = Aid.packageHash(hash)
    return message
  },

  /**
   * Package checkpoint hash for publication.
   *
   * Prefixes with ASCII bytes `'ORRecord'`.
   *
   * @param {Buffer} hash - Checkpoint hash.
   *
   * @return {Buffer} Packaged message.
   */
  packageHash (hash) {
    const message = Buffer.concat([
      hashPrefix,
      hash
    ])
    return message
  }
}

module.exports = Aid
