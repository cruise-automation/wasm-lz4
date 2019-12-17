//  Copyright (c) 2018-present, Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

process.env.NODE_ENV = "test";

const fs = require("fs");
const assert = require("assert");
const { open } = require("rosbag");

const decompress = require("../");
const compressed = fs.readFileSync(`${__dirname}/compressed.lz4`);
const uncompressed = fs.readFileSync(`${__dirname}/uncompressed.txt`);

// note: we cannot put this within a mocha test
// because wasm compiles faster than mocha starts the first test
assert.throws(() => {
  decompress(compressed, uncompressed.byteLength);
});

describe("wasm-lz4", () => {
  it("waits until module is ready", done => {
    decompress.isLoaded.then(done);
  });

  it("does not add an uhandledRejection listener", () => {
    assert(process.listeners("unhandledRejection").length === 0);
  });

  it("preserves existing unhandledRejection listeners", () => {
    const path = require.resolve("../wasm-lz4.js");
    require.cache[path] = undefined;
    const unhandled = err => process.exit(1);
    process.on("unhandledRejection", unhandled);
    const mod = require("../");
    assert(process.listeners("unhandledRejection").length === 1);
    process.removeAllListeners("unhandledRejection");
  });

  it("decompresses rosbag chunks", async () => {
    const bag = await open(`${__dirname}/example-lz4.bag`);
    const options = {
      topics: ["/turtle1/color_sensor"],
      decompress: {
        lz4: (buffer, size) => {
          return decompress(buffer, size);
        }
      }
    };
    let start = Date.now();
    let count = 0;
    const messages = [];
    await bag.readMessages(options, msg => {
      messages.push(msg.message);
    });
    assert(messages.length === 1351);
    assert(messages[0].r === 69);
    assert(messages[1].g === 86);
    assert(messages[1].b === 255);
  });

  it("decompresses accurately", () => {
    const result = decompress(compressed, uncompressed.byteLength);
    assert(result.byteLength === uncompressed.byteLength);
    for (var i = 0; i < result.byteLength; i++) {
      assert(result[i] === uncompressed[i]);
    }
  });

  it("does not grow the heap after multiple decompression calls", () => {
    const originalHeapSize = decompress.__module.HEAP8.buffer.byteLength;
    for (var i = 0; i < 10000; i++) {
      decompress(compressed, uncompressed.byteLength);
    }
    const newHeapSize = decompress.__module.HEAP8.buffer.byteLength;
    assert(originalHeapSize === newHeapSize);
  });

  it("can decompress into a space greater than uncompressed byte length", () => {
    const result = decompress(compressed, uncompressed.byteLength + 100);
    assert(result.byteLength === uncompressed.byteLength);
    for (var i = 0; i < result.byteLength; i++) {
      assert(result[i] === uncompressed[i]);
    }
  });

  it("throws when decompressing into too small of a result buffer", () => {
    assert.throws(() => {
      const result = decompress(compressed, uncompressed.byteLength - 100);
    });
  });

  it("throws an error if decompressing invalid buffer", () => {
    assert.throws(() => {
      const result = decompress(Buffer.alloc(10, 1), 100);
    });
  });
});
