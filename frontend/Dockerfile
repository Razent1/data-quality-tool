FROM node:lts-alpine as build-step
WORKDIR /app

ARG SERVER_HOST
ARG DATABRICKS_ACCOUNT_ID

ENV PATH /app/node_modules/.bin:$PATH
ENV REACT_APP_DATABRICKS_HOST_NAME=$SERVER_HOST
ENV REACT_APP_DATABRICKS_ACCOUNT_ID=$DATABRICKS_ACCOUNT_ID

COPY package.json  ./
COPY ./src ./src
COPY ./public ./public

RUN npm install
RUN npm run build

# Build step #2: build an Caddy container
FROM caddy:alpine
EXPOSE 80
EXPOSE 443
COPY --from=build-step /app/build /usr/share/caddy