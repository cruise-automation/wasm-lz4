#!/usr/bin/env bash

emcc \
  vendor/lz4/lib/lz4.c \
  vendor/lz4/lib/xxhash.c \
  vendor/lz4/lib/lz4frame.c \
  -o dist/wasm-lz4.js src/wasm-lz4.c `# this runs emscripten on the code in wasm-lz4.c` \
  -O3 `# compile with all optimizations enabled` \
  -s WASM=1 `# compile to .wasm instead of asm.js` \
  --pre-js pre.js `# include pre.js at the top of wasm-lz4.js` \
  -s MODULARIZE=1 `# include module boilerplate for better node/webpack interop` \
  -s NO_EXIT_RUNTIME=1 `# keep the process around after main exits` \
  -s TOTAL_STACK=1048576 `# use a 1MB stack size instead of the default 5MB` \
  -s INITIAL_MEMORY=2097152 `# start with a 2MB allocation instead of 16MB, we will dynamically grow` \
  -s ALLOW_MEMORY_GROWTH=1  `# need this because we don't know how large decompressed blocks will be` \
  -s NODEJS_CATCH_EXIT=0 `# we don't use exit() and catching exit will catch all exceptions` \
  -s NODEJS_CATCH_REJECTION=0 `# prevent emscripten from adding an unhandledRejection handler` \
  -s "EXPORTED_FUNCTIONS=['_malloc', '_free']" `# index.js uses Module._malloc and Module._free`

cp src/index.js dist/index.js
