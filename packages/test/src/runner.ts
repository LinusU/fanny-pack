import Mocha = require('mocha')
import test = require('./')

export = function defaultRunner (): test.TestRunner {
  const mocha = new Mocha()

  return {
    addTest (name, fn) {
      mocha.suite.addTest(new Mocha.Test(name, fn))
    },
    afterEach (name, fn) {
      mocha.suite.afterEach(name, fn)
    },
    run () {
      mocha.run((failures) => {
        process.exitCode = failures ? 1 : 0
      })
    }
  }
}
