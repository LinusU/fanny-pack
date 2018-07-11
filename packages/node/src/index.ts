if (typeof Symbol.asyncIterator === 'undefined') {
  Object.assign(Symbol, { asyncIterator: Symbol.for('Symbol.asyncIterator') })
}

import { FannyPack, KeyRange, JSONValue } from '@fanny-pack/core'
import leveldown = require('leveldown')
import pifi = require('pifi')

const kLocation = Symbol('location')
const kStore = Symbol('store')

function notFoundToUndefined (err: Error) {
  if (err.message.startsWith('NotFound:')) {
    return undefined
  } else {
    throw err
  }
}

function notFoundToFalse (err: Error) {
  if (err.message.startsWith('NotFound:')) {
    return false
  } else {
    throw err
  }
}

export = class FannyPackNode implements FannyPack {
  [kLocation]: string
  [kStore]: Promise<leveldown.LevelDown>

  constructor (location: string) {
    const store = leveldown(location)

    this[kLocation] = location
    this[kStore] = pifi((cb) => store.open((err) => cb(err, store)))
  }

  close () {
    return this[kStore].then((store) => {
      this[kStore] = Promise.reject('Database is closed')
      return pifi<undefined>((cb) => store.close(cb))
    })
  }

  async clear () {
    const oldStore = await this[kStore]

    let resolve!: (value: Promise<leveldown.LevelDown>) => void
    this[kStore] = new Promise<leveldown.LevelDown>((_resolve) => { resolve = _resolve })

    await pifi(cb => oldStore.close(cb))
    // FIXME: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/27174
    await pifi(cb => (leveldown as any).destroy(this[kLocation], cb))

    const store = leveldown(this[kLocation])
    resolve(pifi(cb => store.open((err) => cb(err, store))))
  }

  delete (key: string) {
    return this[kStore].then(store => pifi<undefined>(cb => store.del(key, cb)))
  }

  set (key: string, value: JSONValue) {
    return this[kStore].then(store => pifi<undefined>(cb => store.put(key, JSON.stringify(value), cb)))
  }

  async get (key: string) {
    const store = await this[kStore]

    return pifi<string>(cb => store.get(key, { asBuffer: false }, cb))
      .then(value => JSON.parse(value))
      .catch(notFoundToUndefined)
  }

  async has (key: string) {
    const store = await this[kStore]
    const it = store.iterator({ gte: key, lte: key, keyAsBuffer: false, values: false })
    const found = await pifi<string | undefined>((cb) => it.next(cb))

    if (found === undefined) return false

    await pifi<void>((cb) => it.end(cb))

    return true
  }

  async * keys (range: KeyRange = {}) {
    const store = await this[kStore]
    const it = store.iterator({ ...range, keyAsBuffer: false, values: false })

    while (true) {
      const key = await pifi<string | undefined>((cb) => it.next(cb))
      if (key === undefined) break
      yield key
    }
  }

  async * values (range: KeyRange = {}) {
    const store = await this[kStore]
    const it = store.iterator({ ...range, keyAsBuffer: false, valueAsBuffer: false })

    while (true) {
      const val = await pifi<string | undefined>((cb) => it.next((err, _, val) => cb(err, val)))
      if (val === undefined) break
      yield JSON.parse(val)
    }
  }

  async * entries (range: KeyRange = {}) {
    const store = await this[kStore]
    const it = store.iterator({ ...range, keyAsBuffer: false, valueAsBuffer: false })

    while (true) {
      const [key, val] = await pifi<[string, string] | [undefined, undefined]>((cb) => it.next((err, key, val) => cb(err, [key, val])))
      if (key === undefined || val === undefined) break
      yield [key, JSON.parse(val)] as [string, JSONValue]
    }
  }
}
