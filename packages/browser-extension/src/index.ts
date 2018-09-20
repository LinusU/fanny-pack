import { FannyPack, KeyRange, JSONValue } from '@fanny-pack/core'
import storage = require('@wext/storage')

const kName = Symbol('name')
const kStorageArea = Symbol('storage-area')

function * filterKeys (name: string, keys: string[], range: KeyRange) {
  const prefix = `${name}/`
  const stop = `${name}0`

  let started = false
  for (const key of keys) {
    if (started === false && 'gt' in range && key > `${prefix}${range.gt}`) started = true
    if (started === false && 'gte' in range && key >= `${prefix}${range.gte}`) started = true
    if (started === false && !('gt' in range) && !('gte' in range) && key >= prefix) started = true

    if ('lt' in range && key >= `${prefix}${range.lt}`) break
    if (started) yield key.replace(prefix, '')

    if ('lte' in range && key >= `${prefix}${range.lte}`) break
    if (key >= stop) break
  }
}

export = class FannyPackBrowserExtension implements FannyPack {
  [kStorageArea]: 'local' | 'sync'
  [kName]: string

  constructor (storageArea: 'local' | 'sync', name: string) {
    this[kStorageArea] = storageArea
    this[kName] = name
  }

  async clear () {
    const keys = Object.keys(await storage[this[kStorageArea]].get(null)).sort()
    const filteredKeys = Array.from(filterKeys(this[kName], keys, {}))
    await storage[this[kStorageArea]].remove(filteredKeys.map(key => `${this[kName]}/${key}`))
  }

  delete (key: string) {
    return storage[this[kStorageArea]].remove(`${this[kName]}/${key}`)
  }

  set (key: string, value: JSONValue) {
    return storage[this[kStorageArea]].set({ [`${this[kName]}/${key}`]: value })
  }

  get (key: string) {
    return storage[this[kStorageArea]].get(`${this[kName]}/${key}`).then(result => result[`${this[kName]}/${key}`])
  }

  has (key: string) {
    return this.get(key).then(value => value !== undefined)
  }

  async * keys (range: KeyRange = {}) {
    const keys = Object.keys(await storage[this[kStorageArea]].get(null)).sort()
    for (const key of filterKeys(this[kName], keys, range)) yield key
  }

  async * values (range: KeyRange = {}) {
    const data = await storage[this[kStorageArea]].get(null)
    const keys = Object.keys(data).sort()

    for (const key of filterKeys(this[kName], keys, range)) yield data[`${this[kName]}/${key}`]
  }

  async * entries (range: KeyRange = {}) {
    const data = await storage[this[kStorageArea]].get(null)
    const keys = Object.keys(data).sort()

    for (const key of filterKeys(this[kName], keys, range)) yield [key, data[`${this[kName]}/${key}`]] as [string, string]
  }
}
