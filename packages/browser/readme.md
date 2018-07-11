# Fanny Pack Browser

[Fanny Pack](https://github.com/LinusU/fanny-pack) running in the browser on top of IndexedDB.

## Installation

```sh
npm install --save @fanny-pack/browser
```

## Usage

```js
const FannyPack = require('@fanny-pack/browser')

const fp = new FannyPack('important-data')
```

You can now use `fp` as any other [Fanny Pack](https://github.com/LinusU/fanny-pack).

## API

### `new FannyPack(databaseName: string)`

Create or open an existing database with the provided name. The data will be stored inside IndexedDB.

The rest of the API follows the shared [Fanny Pack API](https://github.com/LinusU/fanny-pack#api).
