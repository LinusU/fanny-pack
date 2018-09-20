# Fanny Pack

Fanny Pack is a non-fancy, but very practical, key/value-store.

- ✅ First class support for multiple platforms
- ✅ Very simple, low-level API
- ✅ Easy to get started with
- ✅ Uses promises and async iterators

## Platforms

- [`@fanny-pack/browser`](https://github.com/LinusU/fanny-pack/tree/master/packages/browser)
- [`@fanny-pack/browser-extension`](https://github.com/LinusU/fanny-pack/tree/master/packages/browser-extension)
- [`@fanny-pack/memory`](https://github.com/LinusU/fanny-pack/tree/master/packages/memory)
- [`@fanny-pack/node`](https://github.com/LinusU/fanny-pack/tree/master/packages/node)
- [`@fanny-pack/react-native`](https://github.com/LinusU/fanny-pack/tree/master/packages/react-native)

## Usage

```js
const FannyPack = require('@fanny-pack/memory')

const fp = new FannyPack()

/*** Set Values ***/
await fp.set('b', 'World')
await fp.set('a', 'Hello')
await fp.set('c', 'Linus')

/*** Get Values ***/
console.log(await fp.get('c'))
//=> 'Linus'

console.log(await fp.get('d'))
//=> undefined

/*** Check Presence ***/
console.log(await fp.has('c'))
//=> true

console.log(await fp.has('d'))
//=> false

/*** Iterate Content ***/
for await (const key of fp.keys()) {
  console.log(key)
}
//=> 'a', 'b', 'c'

for await (const value of fp.values({ lt: 'c' })) {
  console.log(value)
}
//=> 'Hello', 'World'

for await (const key of fp.keys({ gt: 'a', lte: 'c' })) {
  console.log(key)
}
//=> 'b', 'c'
```

## API

### `.clear(): Promise<void>`

Remove all entries from the Fanny Pack.

### `.delete(key: string): Promise<void>`

Remove a specific entry. If no entry with the given key exists, then this is a no-op.

### `.get(key: string): Promise<JSONValue | undefined>`

Return the value of a specific entry. If no entry with the given key exists, `undefined` will be returned.

### `.has (key: string): Promise<boolean>`

Check wether or not an entry with the given key exists.

### `.set (key: string, value: JSONValue): Promise<void>`

Add or update a specific entry.

### `KeyRange`

An object containing any or none of the following properties:

- `gt` (greater than), `gte` (greater than or equal) define the lower bound of the entries to be fetched and will determine the starting point. Only entries where the key is greater than (or equal to) this option will be included in the range.

- `lt` (less than), `lte` (less than or equal) define the higher bound of the range to be fetched. Only entries where the key is less than (or equal to) this option will be included in the range.

### `.keys(range?: KeyRange): AsyncIterableIterator<string>`

Returns an asynchrounous iterator over the keys in the Fanny Pack. Specify a `range` to limit which entries to include.

### `.values(range?: KeyRange): AsyncIterableIterator<JSONValue>`

Returns an asynchrounous iterator over the values in the Fanny Pack. Specify a `range` to limit which entries to include.

### `.entries(range?: KeyRange): AsyncIterableIterator<[string, JSONValue]>`

Returns an asynchrounous iterator over the entries in the Fanny Pack. Specify a `range` to limit which entries to include.

## Accepting Fanny Packs

If you have a library that needs to store stuff, accepting a Fanny Pack is the perfect way to do it. That way your library can stay platform independent, and your users can store their data in one place.

All Fanny Packs are versioned and released at the same time. To declare what version your library is compatible with, declare a `peerDependency` on `@fanny-pack/core`. All Fanny Pack implementations depend on that package, and thus any Fanny Pack the user depends on will have to fall in that range.
