# Fanny Pack Browser

[Fanny Pack](https://github.com/LinusU/fanny-pack) running in a browser extension on top of [the `storage` API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage).

## Installation

```sh
npm install --save @fanny-pack/browser-extension
```

## Usage

```js
const FannyPack = require('@fanny-pack/browser-extension')

const fp = new FannyPack('sync', 'important-data')
```

You can now use `fp` as any other [Fanny Pack](https://github.com/LinusU/fanny-pack).

## API

### `new FannyPack(storageArea: string, databaseName: string)`

Create or open an existing database with the provided name, in the given storage area.

Valid storage areas:

- `local` - Items in `local` storage are local to the machine the extension was installed on.
- `sync` - Items in `sync` storage are synced by the browser, and are available across all instances of that browser that the user is logged into, across different devices.

The rest of the API follows the shared [Fanny Pack API](https://github.com/LinusU/fanny-pack#api).
