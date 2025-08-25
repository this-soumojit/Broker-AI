FROM node:20-alpine as build

WORKDIR /app

COPY package.json .yarnrc.yml ./

COPY . .

RUN corepack enable

RUN yarn install

ARG VITE_API_URL

ENV VITE_API_URL=${VITE_API_URL}

RUN yarn build

FROM nginx:latest as production

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
