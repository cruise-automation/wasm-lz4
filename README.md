# wasm-lz4

https://github.com/lz4/lz4 compiled to WebAssembly. For now only decompression is supported. PRs welcome!

## API

`wasm-lz4` exports a single function:

```js
export default (buffer: Buffer, destinationByteSize: number) => Buffer
```

Here is an example of using the module:

```js
import fs from 'fs'
import decompress from 'wasm-lz4';

const compressedBytes = fs.readFileSync('compressed.lz4');

// currently you need to know the exact expected size of the output buffer
// so the wasm runtime can allocate enough bytes to decompress into
// TODO: this should not be necessary...it's exposed in the lz4 C code
const outputBytes = compressedBytes * 10;
const decompressedBytes = decompress(compressedBytes, outputBytes);
```

## Using the module in a browser

Emscripten compiled WebAssembly modules are built in 2 parts: a `.js` side and a `.wasm` side.  In the browser the `.js` side needs to download the `.wasm` side from the server so it can compile it.  There is [more information available in the emscripten documentation](https://kripken.github.io/emscripten-site/docs/compiling/Deploying-Pages.html).

### Usage with Webpack

We require the `wasm-lz4.wasm` module in our `locateFile` definition, so that module bundling with dynamic paths is possible. So if you are using Webpack, you can add the following entry:

```
...
rules : [
  ...
  {
    test: /\.wasm$/,
    type: "javascript/auto",
    use: {
      loader: "file-loader",
      options: {
        name: "[name]-[hash].[ext]",
      },
    },
  },
  ...
]
...
 ```

The `javascript/auto` type setting tells Webpack to bypass its default importing logic, and just import the file as-is. Hopefully this hack will go away with improved WebAssembly support in webpack.

## Asynchronous loading & compiling

After the `.wasm` binary is loaded (via `fetch` in the browser or `require` in node) it must be compiled by the WebAssembly runtime.  If you call `decompress` before it is finished compiling it will throw an error indicating it isn't ready yet.  To wait for the module to be loaded you can do something like the following:

```
import decompress from 'wasm-lz4'

async function doWork() {
  await decompress.isLoaded;
  decompress(buffer, outputByteLength);
}
```

## Developing locally

1. Run `npm install` to install dependencies.
2. Run `npm run build` to invoke emcc inside a Docker container and compile the code in `wasm-lz4.c` as well as the required lz4 source files. The output will be in `dist/` on the host machine.
3. Run `npm test` to run the tests.
