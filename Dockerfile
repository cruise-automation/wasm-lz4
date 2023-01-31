FROM emscripten/emsdk:3.1.26

# move source files into /src and npm install
COPY package.json /src
COPY package-lock.json /src
RUN npm install
COPY . /src

# set production node environment
ENV NODE_ENV=production
