FROM node:lts-alpine AS builder

WORKDIR /app

COPY package.json .yarnrc.yml ./

RUN corepack enable

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 8000

CMD ["node", "dist/index.js"]