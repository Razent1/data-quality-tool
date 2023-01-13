FROM node:lts-alpine as build-step
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
#ENV DATABRICKS_HOST_NAME=https://dbc-18975113-1ba6.cloud.databricks.com
#ENV DATABRICKS_ACCOUNT_ID=2520309401638937
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