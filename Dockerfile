FROM node:18-slim AS build

WORKDIR /opt/node_app

COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json

RUN yarn --network-timeout 600000

COPY ./public ./public
COPY ./src ./src

ARG REACT_APP_PROTO_JSON_PATH
ARG REACT_APP_PROTO_JSON_HOST
ARG REACT_APP_GITHUB_API_PRJ_URL
ARG REACT_APP_GITLAB_API_PRJ_URL
RUN export $(cat .env)

ENV NODE_ENV=production
RUN yarn build

FROM nginx:1.28.0-alpine-slim

COPY --from=build /opt/node_app/build /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK CMD wget -q -O /dev/null http://localhost || exit 1
