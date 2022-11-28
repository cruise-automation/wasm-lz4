#  Copyright (c) 2018-present, Cruise LLC
#
#  This source code is licensed under the Apache License, Version 2.0,
#  found in the LICENSE file in the root directory of this source tree.
#  You may not use this file except in compliance with the License.

# FROM apiaryio/emcc:1.37
FROM emscripten/emsdk:3.1.26

# move source files into work_dir
COPY package.json /src
COPY package-lock.json /src
RUN npm install
COPY . /src

# set production node environment
ENV NODE_ENV=production
