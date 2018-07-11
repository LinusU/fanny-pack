# Fanny Pack React Native

[Fanny Pack](https://github.com/LinusU/fanny-pack) running on React Native, backed by AsyncStorage.

## Installation

```sh
npm install --save @fanny-pack/react-native
```

## Usage

```js
const FannyPack = require('@fanny-pack/react-native')

const fp = new FannyPack('important-data')
```

You can now use `fp` as any other [Fanny Pack](https://github.com/LinusU/fanny-pack).

## API

### `new FannyPack(name: string)`

Create a new Fanny Pack with the data stored in `AsyncStorage`, with all keys prefixed with the `name` and a slash.

The rest of the API follows the shared [Fanny Pack API](https://github.com/LinusU/fanny-pack#api).
