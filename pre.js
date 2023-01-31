// this file is injected into the wasm-lz4.js compiled file _before_ most of the module definition
// which gives us the opportunity to override the module resolution behavior in node

var nodePath;

if (typeof process !== "undefined") {
  Module["ENVIRONMENT"] = process.env.WASM_LZ4_ENVIRONMENT;
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
    // Dynamically required if running in a web context.
    const wasm_path = require("./wasm-lz4.wasm");
    return wasm_path;
  }

  return input;
};
