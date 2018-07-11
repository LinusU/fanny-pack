if (typeof Symbol.asyncIterator === 'undefined') {
  Object.assign(Symbol, { asyncIterator: Symbol.for('Symbol.asyncIterator') })
}

import { FannyPack, KeyRange, JSONValue } from '@fanny-pack/core'

const kStore = Symbol('store')

export = class FannyPackMemory implements FannyPack {
  [kStore]: Map<string, string>

  constructor () {
    this[kStore] = new Map()
  }

  clear () {
    this[kStore].clear()
    return Promise.resolve()
  }

  delete (key: string) {
    this[kStore].delete(key)
    return Promise.resolve()
  }

  set (key: string, value: JSONValue) {
    this[kStore].set(key, JSON.stringify(value))
    return Promise.resolve()
  }

  get (key: string) {
    const value = this[kStore].get(key)
    return Promise.resolve(value ? JSON.parse(value) : undefined)
  }

  has (key: string) {
    return Promise.resolve(this[kStore].has(key))
  }

  async * keys (range: KeyRange = {}) {
    const all = [...this[kStore].keys()].sort()

    let started = !('gt' in range || 'gte' in range)
    for (const key of all) {
      if (started === false && 'gt' in range && key > range.gt) started = true
      if (started === false && 'gte' in range && key >= range.gte) started = true

      if ('lt' in range && key >= range.lt) break
      if (started) yield key
      if ('lte' in range && key >= range.lte) break
    }
  }

  async * values (range: KeyRange = {}) {
    const all = [...this[kStore].entries()].sort((lhs, rhs) => lhs[0] < rhs[0] ? -1 : 1)

    let started = !('gt' in range || 'gte' in range)
    for (const [key, value] of all) {
      if (started === false && 'gt' in range && key > range.gt) started = true
      if (started === false && 'gte' in range && key >= range.gte) started = true

      if ('lt' in range && key >= range.lt) break
      if (started) yield JSON.parse(value)
      if ('lte' in range && key >= range.lte) break
    }
  }

  async * entries (range: KeyRange = {}) {
    const all = [...this[kStore].entries()].sort((lhs, rhs) => lhs[0] < rhs[0] ? -1 : 1)

    let started = !('gt' in range || 'gte' in range)
    for (const entry of all) {
      if (started === false && 'gt' in range && entry[0] > range.gt) started = true
      if (started === false && 'gte' in range && entry[0] >= range.gte) started = true

      if ('lt' in range && entry[0] >= range.lt) break
      if (started) yield [entry[0], JSON.parse(entry[1])] as [string, JSONValue]
      if ('lte' in range && entry[0] >= range.lte) break
    }
  }
}
