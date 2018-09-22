class Delay {
  static milliseconds (time) {
    return new Promise(resolve => {
      setTimeout(function handleDelayElapsed () {
        resolve()
      }, time)
    })
  }

  static seconds (time) { return Delay.milliseconds(time * 1000) }
}

Object.freeze(Delay)
Object.freeze(Delay.prototype)

module.exports = Delay
