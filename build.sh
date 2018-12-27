#! /bin/bash

#  Copyright (c) 2018-present, GM Cruise LLC
#
#  This source code is licensed under the Apache License, Version 2.0,
#  found in the LICENSE file in the root directory of this source tree.
#  You may not use this file except in compliance with the License.

emcc \
  lz4/lib/lz4.c \
  lz4/lib/xxhash.c \
  lz4/lib/lz4frame.c \
  -o wasm-lz4.js wasm-lz4.c `# this runs emscripten on the code in wasm-lz4.c` \
  -O3 `# compile with all optimizations enabled` \
  -s WASM=1 `# compile to .wasm instead of asm.js` \
  --pre-js pre.js `# include pre.js at the top of wasm-lz4.js` \
  --post-js post.js `# include post.js at the bottom of wasm-lz4.js` \
  -s MODULARIZE=1 `# include module boilerplate for better node/webpack interop` \
  -s NO_EXIT_RUNTIME=1 `# keep the process around after main exits` \
  -s ALLOW_MEMORY_GROWTH=1  `# need this because we don't know how large decompressed blocks will be` \
  -s NODEJS_CATCH_EXIT=0 `# we don't use exit() and catching exit will catch all exceptions` \
  -s "EXPORTED_FUNCTIONS=['_malloc', '_free']" `# index.js uses Module._malloc and Module._free`
