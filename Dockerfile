#  Copyright (c) 2018-present, Cruise LLC
#
#  This source code is licensed under the Apache License, Version 2.0,
#  found in the LICENSE file in the root directory of this source tree.
#  You may not use this file except in compliance with the License.

FROM apiaryio/emcc:1.37

# allow work_dir to be changed externally
ARG work_dir=/usr/src/app

# set up work_dir
RUN mkdir -p $work_dir
WORKDIR $work_dir

# move source files into work_dir
COPY package.json $work_dir
COPY package-lock.json $work_dir
RUN npm install
COPY . $work_dir

# set production node environment
ENV NODE_ENV=production
