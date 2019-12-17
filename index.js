//  Copyright (c) 2018-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

const ModuleFactory = require("./wasm-lz4");
const Module = ModuleFactory();

var context;

let loaded = false;

function ensureLoaded() {
  if (!loaded) {
    throw new Error(
      `wasm-lz4 has not finished loading. Please wait with "await decompress.isLoaded" before calling decompress`
    );
  }
}

module.exports = function decompress(src, destSize) {
  ensureLoaded();
  const srcSize = src.byteLength;

  const srcPointer = Module._malloc(srcSize);
  const destPointer = Module._malloc(destSize);

  // create a view into the heap for our source buffer
  const compressedHeap = new Uint8Array(Module.HEAPU8.buffer, srcPointer, srcSize);
  // copy source buffer into the heap
  compressedHeap.set(src);

  // initialize the decompression context only once - its reusable
  context = context || Module._createDecompressionContext();

  // call the C function to decompress the frame
  const resultSize = Module._decompressFrame(context, destPointer, destSize, srcPointer, srcSize);

  try {
    if (resultSize === -1) {
      throw new Error("Error during decompression");
    }

    // copy destination buffer out of the heap back into js land
    const output = Buffer.allocUnsafe(resultSize);
    Buffer.from(Module.HEAPU8.buffer).copy(output, 0, destPointer, destPointer + resultSize);
    return output;
  } finally {
    // free the source buffer memory
    Module._free(srcPointer);
    // free destination buffer on the heap
    Module._free(destPointer);
  }
};

// export a promise a consumer can listen to to wait
// for the module to finish loading
// module loading is async and can take
// several hundred milliseconds...accessing the module
// before it is loaded will throw an error
module.exports.isLoaded = new Promise(resolve => {
  Module.onRuntimeInitialized = () => {
    loaded = true;
    resolve();
  };
});

// export the Module object for testing purposes _only_
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.__module = Module;
}
