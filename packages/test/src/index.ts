import Mocha = require('mocha')
import assert = require('assert')

import { FannyPack } from '@fanny-pack/core'

namespace test {
  export interface TestRunner {
    addTest (name: string, fn: () => PromiseLike<void> | void): void
    afterEach (name: string, fn: () => PromiseLike<void> | void): void
    run (): void
  }
}

async function assertYields<T> (iterator: AsyncIterableIterator<T>, expected: T[]) {
  for (const value of expected) {
    assert.deepStrictEqual(await iterator.next(), { done: false, value })
  }

  assert.deepStrictEqual(await iterator.next(), { done: true, value: undefined })
}

function defaultRunner (): test.TestRunner {
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

function test (fp: FannyPack, runner: test.TestRunner = defaultRunner()) {
  runner.afterEach('Clear Data', () => fp.clear())

  runner.addTest('.set()', async () => {
    await fp.set('a', 'Hello')
  })

  runner.addTest('.get() - basics', async () => {
    await fp.set('a', 'Hello')
    await fp.set('b', 'World')
    await fp.set('c', 'Linus')

    assert.strictEqual(await fp.get('a'), 'Hello')
    assert.strictEqual(await fp.get('b'), 'World')
    assert.strictEqual(await fp.get('c'), 'Linus')
  })

  runner.addTest('.get() - clones', async () => {
    const first = { modified: false }
    await fp.set('first', first)

    first.modified = true

    const clone = await fp.get('first')

    assert.deepStrictEqual(first, { modified: true })
    assert.deepStrictEqual(clone, { modified: false })
  })

  runner.addTest('.has()', async () => {
    await fp.set('a', '1')
    await fp.set('b', '2')

    assert.strictEqual(await fp.has('a'), true)
    assert.strictEqual(await fp.has('b'), true)
    assert.strictEqual(await fp.has('c'), false)
    assert.strictEqual(await fp.has('d'), false)
  })

  runner.addTest('.clear()', async () => {
    await fp.set('a', 'Hello')
    assert.strictEqual(await fp.get('a'), 'Hello')

    await fp.clear()
    assert.strictEqual(await fp.get('a'), undefined)
  })

  runner.addTest('.delete() - basics', async () => {
    await fp.set('a', '1')
    await fp.set('b', '2')
    await fp.set('c', '3')

    assert.strictEqual(await fp.get('a'), '1')
    assert.strictEqual(await fp.get('b'), '2')
    assert.strictEqual(await fp.get('c'), '3')

    await fp.delete('b')

    assert.strictEqual(await fp.get('a'), '1')
    assert.strictEqual(await fp.get('b'), undefined)
    assert.strictEqual(await fp.get('c'), '3')

    await fp.delete('a')

    assert.strictEqual(await fp.get('a'), undefined)
    assert.strictEqual(await fp.get('b'), undefined)
    assert.strictEqual(await fp.get('c'), '3')

    await fp.delete('c')

    assert.strictEqual(await fp.get('a'), undefined)
    assert.strictEqual(await fp.get('b'), undefined)
    assert.strictEqual(await fp.get('c'), undefined)
  })

  runner.addTest('.delete() - unset', async () => {
    await fp.delete('a')
    await fp.delete('a')
  })

  runner.addTest('.keys() - basics', async () => {
    await fp.set('a', '1')
    await fp.set('b', '2')
    await fp.set('c', '3')

    await assertYields(fp.keys(), ['a', 'b', 'c'])
  })

  runner.addTest('.keys() - sort order', async () => {
    await fp.set('c', 'c')
    await fp.set('e', 'e')
    await fp.set('d', 'd')
    await fp.set('a', 'a')
    await fp.set('f', 'f')
    await fp.set('b', 'b')

    await assertYields(fp.keys(), ['a', 'b', 'c', 'd', 'e', 'f'])
  })

  runner.addTest('.keys() - ranges', async () => {
    await fp.set('a', '1')
    await fp.set('b', '2')
    await fp.set('c', '3')

    await assertYields(fp.keys({ gt: 'a' }), ['b', 'c'])
    await assertYields(fp.keys({ gt: 'b' }), ['c'])
    await assertYields(fp.keys({ gt: 'c' }), [])
    await assertYields(fp.keys({ gte: 'a' }), ['a', 'b', 'c'])
    await assertYields(fp.keys({ gte: 'b' }), ['b', 'c'])
    await assertYields(fp.keys({ gte: 'c' }), ['c'])

    await assertYields(fp.keys({ lt: 'a' }), [])
    await assertYields(fp.keys({ lt: 'b' }), ['a'])
    await assertYields(fp.keys({ lt: 'c' }), ['a', 'b'])
    await assertYields(fp.keys({ lte: 'a' }), ['a'])
    await assertYields(fp.keys({ lte: 'b' }), ['a', 'b'])
    await assertYields(fp.keys({ lte: 'c' }), ['a', 'b', 'c'])

    await assertYields(fp.keys({ gt: 'a', lt: 'c' }), ['b'])
    await assertYields(fp.keys({ gt: 'b', lt: 'c' }), [])

    await assertYields(fp.keys({ gte: 'a', lte: 'c' }), ['a', 'b', 'c'])
    await assertYields(fp.keys({ gte: 'b', lte: 'c' }), ['b', 'c'])
    await assertYields(fp.keys({ gte: 'c', lte: 'c' }), ['c'])
  })

  runner.addTest('.values() - basics', async () => {
    await fp.set('a', '1')
    await fp.set('b', '2')
    await fp.set('c', '3')

    await assertYields(fp.values(), ['1', '2', '3'])
  })

  runner.addTest('.values() - sort order', async () => {
    await fp.set('c', '3')
    await fp.set('e', '5')
    await fp.set('d', '4')
    await fp.set('a', '1')
    await fp.set('f', '6')
    await fp.set('b', '2')

    await assertYields(fp.values(), ['1', '2', '3', '4', '5', '6'])
  })

  runner.addTest('.values() - ranges', async () => {
    await fp.set('a', '1')
    await fp.set('b', '2')
    await fp.set('c', '3')

    await assertYields(fp.values({ gt: 'a' }), ['2', '3'])
    await assertYields(fp.values({ gt: 'b' }), ['3'])
    await assertYields(fp.values({ gt: 'c' }), [])
    await assertYields(fp.values({ gte: 'a' }), ['1', '2', '3'])
    await assertYields(fp.values({ gte: 'b' }), ['2', '3'])
    await assertYields(fp.values({ gte: 'c' }), ['3'])

    await assertYields(fp.values({ lt: 'a' }), [])
    await assertYields(fp.values({ lt: 'b' }), ['1'])
    await assertYields(fp.values({ lt: 'c' }), ['1', '2'])
    await assertYields(fp.values({ lte: 'a' }), ['1'])
    await assertYields(fp.values({ lte: 'b' }), ['1', '2'])
    await assertYields(fp.values({ lte: 'c' }), ['1', '2', '3'])

    await assertYields(fp.values({ gt: 'a', lt: 'c' }), ['2'])
    await assertYields(fp.values({ gt: 'b', lt: 'c' }), [])

    await assertYields(fp.values({ gte: 'a', lte: 'c' }), ['1', '2', '3'])
    await assertYields(fp.values({ gte: 'b', lte: 'c' }), ['2', '3'])
    await assertYields(fp.values({ gte: 'c', lte: 'c' }), ['3'])
  })

  runner.addTest('.entries() - basics', async () => {
    await fp.set('a', '1')
    await fp.set('b', '2')
    await fp.set('c', '3')

    await assertYields(fp.entries(), [['a', '1'], ['b', '2'], ['c', '3']])
  })

  runner.addTest('.entries() - sort order', async () => {
    await fp.set('c', '3')
    await fp.set('e', '5')
    await fp.set('d', '4')
    await fp.set('a', '1')
    await fp.set('f', '6')
    await fp.set('b', '2')

    await assertYields(fp.entries(), [['a', '1'], ['b', '2'], ['c', '3'], ['d', '4'], ['e', '5'], ['f', '6']])
  })

  runner.addTest('.entries() - ranges', async () => {
    await fp.set('a', '1')
    await fp.set('b', '2')
    await fp.set('c', '3')

    await assertYields(fp.entries({ gt: 'a' }), [['b', '2'], ['c', '3']])
    await assertYields(fp.entries({ gt: 'b' }), [['c', '3']])
    await assertYields(fp.entries({ gt: 'c' }), [])
    await assertYields(fp.entries({ gte: 'a' }), [['a', '1'], ['b', '2'], ['c', '3']])
    await assertYields(fp.entries({ gte: 'b' }), [['b', '2'], ['c', '3']])
    await assertYields(fp.entries({ gte: 'c' }), [['c', '3']])

    await assertYields(fp.entries({ lt: 'a' }), [])
    await assertYields(fp.entries({ lt: 'b' }), [['a', '1']])
    await assertYields(fp.entries({ lt: 'c' }), [['a', '1'], ['b', '2']])
    await assertYields(fp.entries({ lte: 'a' }), [['a', '1']])
    await assertYields(fp.entries({ lte: 'b' }), [['a', '1'], ['b', '2']])
    await assertYields(fp.entries({ lte: 'c' }), [['a', '1'], ['b', '2'], ['c', '3']])

    await assertYields(fp.entries({ gt: 'a', lt: 'c' }), [['b', '2']])
    await assertYields(fp.entries({ gt: 'b', lt: 'c' }), [])

    await assertYields(fp.entries({ gte: 'a', lte: 'c' }), [['a', '1'], ['b', '2'], ['c', '3']])
    await assertYields(fp.entries({ gte: 'b', lte: 'c' }), [['b', '2'], ['c', '3']])
    await assertYields(fp.entries({ gte: 'c', lte: 'c' }), [['c', '3']])
  })

  runner.run()
}

export = test
