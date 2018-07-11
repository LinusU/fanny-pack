# Fanny Pack Node.js

[Fanny Pack](https://github.com/LinusU/fanny-pack) running on Node.js, backed by [leveldown](https://github.com/Level/leveldown).

## Installation

```sh
npm install --save @fanny-pack/node
```

## Usage

```js
const FannyPack = require('@fanny-pack/node')

const fp = new FannyPack('./important-data')
```

You can now use `fp` as any other [Fanny Pack](https://github.com/LinusU/fanny-pack).

## API

### `new FannyPack(location: string)`

Create or open an existing database at the provided location. The data will be stored using [leveldown](https://github.com/Level/leveldown).

### `.close(): Promise<void>`

Close the underlying LevelDB database.

The rest of the API follows the shared [Fanny Pack API](https://github.com/LinusU/fanny-pack#api).
