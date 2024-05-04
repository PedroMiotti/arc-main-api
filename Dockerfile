FROM node:18.17.1

# Create app directory, this is in our container/in our image
WORKDIR /usr/src/app

ENV NODE_ENV dev

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./


RUN yarn install --frozen-lockfile
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npx prisma generate

RUN yarn build

CMD [ "node", "dist/main" ]