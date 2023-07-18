FROM node:18-alpine3.18 as builder
WORKDIR /usr/src/app

COPY prisma ./prisma
COPY src ./src
COPY package.json tsconfig.json tsoa-config.js metadata.json* yarn.lock ./
#RUN apt-get update && apt-get install -y openssl libssl-dev
RUN yarn install
RUN yarn build

## this is stage two, where the app actually runs

FROM node:18-alpine3.18

WORKDIR /usr/src/app

COPY prisma ./prisma
COPY package.json yarn.lock metadata.json* ./
COPY --from=builder /usr/src/app/build ./build

RUN yarn install --frozen-lockfile --production
RUN yarn prisma generate

CMD ["node", "build/app.js"]
