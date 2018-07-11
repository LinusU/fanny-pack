import Implementation = require('./')
import test = require('@fanny-pack/test')

declare function it (name: string, fn: () => PromiseLike<void> | void): void
declare function afterEach (name: string, fn: () => PromiseLike<void> | void): void

test(new Implementation('test'), {
  addTest: it,
  afterEach: afterEach,
  run: () => undefined
})
