//  Copyright (c) 2018-present, GM Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

// this file is injected into the wasm-lz4.js compiled file _before_ most of the module definition
// which gives us the opportunity to override the module resolution behavior in node

var nodePath;
var WASM_PATH = require("./wasm-lz4.wasm");

if (typeof process !== "undefined") {
  Module["ENVIRONMENT"] = process.env.WASM_LZ4_ENVIRONMENT;
}

var existingUncaughtListeners = [];
// need to work around emscripten adding a process.exit(1) whenever
// an unhandledRejection is emitted by process in node by saving any existing listeners
// and then re-adding them in post.js
// https://github.com/kripken/emscripten/pull/5948
if (ENVIRONMENT_IS_NODE) {
  existingUncaughtListeners = process.listeners("unhandledRejection") || [];
}


// do some manipulating of the input file path
// when running in node so the file is resolved
// relative to the module root. by default its resolved to `wasm-lz4.wasm`
// which is relative to process.cwd which is not correct
Module.locateFile = function(input) {
  if (ENVIRONMENT_IS_NODE) {
    // don't let emscripten js resolve the file to a relative path
    nodePath = {
      normalize: function(any) {
        return any;
      }
    };
    // return the full resolved path to the input file
    return __dirname +  "/" + input;
  }
  if (input.endsWith(".wasm")) {
    return WASM_PATH;
  }

  return input;
};
