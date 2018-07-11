import { AsyncStorage } from 'react-native'
import { FannyPack, KeyRange, JSONValue } from '@fanny-pack/core'
import Mutex = require('ts-mutex')
import unwrapAsyncIterableIteratorPromise = require('unwrap-async-iterable-iterator-promise')

const kEntries = Symbol('entries')
const kKeys = Symbol('keys')
const kLock = Symbol('lock')
const kName = Symbol('prefix')
const kValues = Symbol('values')

const BATCH_SIZE = 32

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

export = class FannyPackReactNative implements FannyPack {
  [kLock]: Mutex
  [kName]: string

  constructor (name: string) {
    this[kLock] = new Mutex()
    this[kName] = name
  }

  clear () {
    return this[kLock].use(() => {
      return AsyncStorage.getAllKeys().then((all) => {
        return AsyncStorage.multiRemove(all.filter(key => key.startsWith(`${this[kName]}/`)))
      })
    })
  }

  delete (key: string) {
    return this[kLock].use(() => AsyncStorage.removeItem(`${this[kName]}/${key}`))
  }

  set (key: string, value: JSONValue) {
    return this[kLock].use(() => AsyncStorage.setItem(`${this[kName]}/${key}`, JSON.stringify(value)))
  }

  get (key: string) {
    return this[kLock].use(() => AsyncStorage.getItem(`${this[kName]}/${key}`)).then(value => value ? JSON.parse(value) : undefined)
  }

  has (key: string) {
    return this[kLock].use(() => AsyncStorage.getItem(`${this[kName]}/${key}`)).then(value => Boolean(value))
  }

  async * [kKeys] (range: KeyRange) {
    const all = (await AsyncStorage.getAllKeys()).sort()

    for (const key of filterKeys(this[kName], all, range)) yield key
  }

  async * [kValues] (range: KeyRange) {
    const all = (await AsyncStorage.getAllKeys()).sort()

    let batch = []

    for (const key of filterKeys(this[kName], all, range)) {
      batch.push(`${this[kName]}/${key}`)

      if (batch.length === BATCH_SIZE) {
        const entries = (await AsyncStorage.multiGet(batch)).sort((lhs, rhs) => lhs[0] < rhs[0] ? -1 : 1)
        for (const entry of entries) yield JSON.parse(entry[1])
        batch = []
      }
    }

    if (batch.length > 0) {
      const entries = (await AsyncStorage.multiGet(batch)).sort((lhs, rhs) => lhs[0] < rhs[0] ? -1 : 1)
      for (const entry of entries) yield JSON.parse(entry[1])
    }
  }

  async * [kEntries] (range: KeyRange) {
    const prefix = `${this[kName]}/`
    const all = (await AsyncStorage.getAllKeys()).sort()

    let batch = []

    for (const key of filterKeys(this[kName], all, range)) {
      batch.push(`${prefix}${key}`)

      if (batch.length === BATCH_SIZE) {
        const entries = (await AsyncStorage.multiGet(batch)).sort((lhs, rhs) => lhs[0] < rhs[0] ? -1 : 1)
        for (const entry of entries) yield [entry[0].replace(prefix, ''), JSON.parse(entry[1])] as [string, JSONValue]
        batch = []
      }
    }

    if (batch.length > 0) {
      const entries = (await AsyncStorage.multiGet(batch)).sort((lhs, rhs) => lhs[0] < rhs[0] ? -1 : 1)
      for (const entry of entries) yield [entry[0].replace(prefix, ''), JSON.parse(entry[1])] as [string, JSONValue]
    }
  }

  keys (range: KeyRange = {}) {
    return unwrapAsyncIterableIteratorPromise(this[kLock].use(() => this[kKeys](range)))
  }

  values (range: KeyRange = {}) {
    return unwrapAsyncIterableIteratorPromise(this[kLock].use(() => this[kValues](range)))
  }

  entries (range: KeyRange = {}) {
    return unwrapAsyncIterableIteratorPromise(this[kLock].use((() => this[kEntries](range))))
  }
}
