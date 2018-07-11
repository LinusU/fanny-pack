# Fanny Pack Memory

[Fanny Pack](https://github.com/LinusU/fanny-pack) running on any JavaScript environment, without persisting data. Useful for testing.

## Installation

```sh
npm install --save @fanny-pack/memory
```

## Usage

```js
const FannyPack = require('@fanny-pack/memory')

const fp = new FannyPack()
```

You can now use `fp` as any other [Fanny Pack](https://github.com/LinusU/fanny-pack).

## API

### `new FannyPack()`

Create a new Fanny Pack. The data will not be stored.

The rest of the API follows the shared [Fanny Pack API](https://github.com/LinusU/fanny-pack#api).
