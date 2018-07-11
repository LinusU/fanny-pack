import { FannyPack, KeyRange, JSONValue } from '@fanny-pack/core'

import unwrapAsyncIterableIteratorPromise = require('unwrap-async-iterable-iterator-promise')

if (typeof Symbol.asyncIterator === 'undefined') {
  Object.assign(Symbol, { asyncIterator: Symbol.for('Symbol.asyncIterator') })
}

const kDatabase = Symbol('store')
const kTransaction = Symbol('transaction')

const STORE_NAME = 'fanny-pack'

function createIDBRange (range: KeyRange): IDBKeyRange | undefined {
  if ('gt' in range && 'lt' in range) return IDBKeyRange.bound(range.gt, range.lt, true, true)
  if ('gt' in range && 'lte' in range) return IDBKeyRange.bound(range.gt, range.lte, true, false)
  if ('gte' in range && 'lt' in range) return IDBKeyRange.bound(range.gte, range.lt, false, true)
  if ('gte' in range && 'lte' in range) return IDBKeyRange.bound(range.gte, range.lte, false, false)

  if ('gt' in range) return IDBKeyRange.lowerBound(range.gt, true)
  if ('gte' in range) return IDBKeyRange.lowerBound(range.gte, false)
  if ('lt' in range) return IDBKeyRange.upperBound(range.lt, true)
  if ('lte' in range) return IDBKeyRange.upperBound(range.lte, false)

  return undefined
}

function createCursorIterator<Cursor extends IDBCursor, Item> (cursor: IDBRequest, mapFn: (cursor: Cursor) => Item): AsyncIterableIterator<Item> {
  let buffer: IteratorResult<Item>[] = []
  let queue: ((result: IteratorResult<Item>) => void)[] = []

  cursor.onsuccess = function () {
    // FIXME: https://github.com/Microsoft/TypeScript/issues/25558
    const result: IteratorResult<Item> = this.result
      ? { value: mapFn(this.result), done: false }
      : { value: undefined, done: true } as any

    if (queue.length) {
      queue.shift()!(result)
    } else {
      buffer.push(result)
    }

    if (this.result) this.result.continue()
  }

  return {
    next (value?: any): Promise<IteratorResult<Item>> {
      return new Promise((resolve) => buffer.length ? resolve(buffer.shift()) : queue.push(resolve))
    },
    [Symbol.asyncIterator] (): AsyncIterableIterator<Item> {
      return this
    }
  }
}

export = class FannyPackBrowser implements FannyPack {
  [kDatabase]: Promise<IDBDatabase>

  constructor (name: string) {
    this[kDatabase] = new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result as IDBDatabase)
      req.onupgradeneeded = () => (req.result as IDBDatabase).createObjectStore(STORE_NAME)
    })
  }

  [kTransaction]<T> (type: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
    return this[kDatabase].then(db => new Promise<T>((resolve, reject) => {
      let req: IDBRequest

      const tx = db.transaction(STORE_NAME, type)
      tx.oncomplete = () => resolve(req.result as T)
      tx.onabort = tx.onerror = () => reject(tx.error)

      req = fn(tx.objectStore(STORE_NAME))
    }))
  }

  clear () {
    return this[kTransaction]<void>('readwrite', (store) => store.clear())
  }

  delete (key: string) {
    return this[kTransaction]<void>('readwrite', (store) => store.delete(key))
  }

  set (key: string, value: JSONValue) {
    return this[kTransaction]<string>('readwrite', (store) => store.put(value, key)).then(() => undefined)
  }

  get (key: string) {
    return this[kTransaction]<any>('readonly', (store) => store.get(key))
  }

  has (key: string) {
    return this[kTransaction]<string>('readonly', (store) => store.getKey(key)).then(result => (result === key))
  }

  keys (range: KeyRange = {}) {
    return unwrapAsyncIterableIteratorPromise(this[kDatabase].then(db => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const cursorRequest = store.openKeyCursor(createIDBRange(range))

      return createCursorIterator<IDBCursor, string>(cursorRequest, item => item.key as string)
    }))
  }

  values (range: KeyRange = {}) {
    return unwrapAsyncIterableIteratorPromise(this[kDatabase].then(db => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const cursorRequest = store.openCursor(createIDBRange(range))

      return createCursorIterator<IDBCursorWithValue, JSONValue>(cursorRequest, item => item.value)
    }))
  }

  entries (range: KeyRange = {}) {
    return unwrapAsyncIterableIteratorPromise(this[kDatabase].then(db => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const cursorRequest = store.openCursor(createIDBRange(range))

      return createCursorIterator<IDBCursorWithValue, [string, JSONValue]>(cursorRequest, item => [item.key as string, item.value])
    }))
  }
}
