#!/usr/bin/bash

#export SERVER_HOST=<databricks-host>
#export HTTP_PATH=<databricks-http-path>
#export NOTEBOOK_PATH=<databricks-notebook-path>
#export CLUSTER_ID=<databricks-cluster-id>
#export RESULT_DATABASE=<databricks-result-database>
#export RESULT_TABLE_NAME=<databricks-result-table>
#export DATABRICKS_ACCOUNT_ID=<databricks-account-id>
#export SLACK_CHANNEL_URL=<slack-channel-url>
#export SLACK_CHANNEL_NAME=<slack-channel-name>

service="$1"

if [ -z "$1" ]; then
  docker-compose build --build-arg TOKEN \
  --build-arg SERVER_HOST \
  --build-arg HTTP_PATH \
  --build-arg NOTEBOOK_PATH \
  --build-arg CLUSTER_ID \
  --build-arg RESULT_DATABASE \
  --build-arg RESULT_TABLE_NAME \
  --build-arg DATABRICKS_ACCOUNT_ID \
  --build-arg SLACK_CHANNEL_URL \
  --build-arg SLACK_CHANNEL_NAME
  docker-compose up -d
else
  docker-compose build --build-arg TOKEN \
    --build-arg SERVER_HOST \
    --build-arg HTTP_PATH \
    --build-arg NOTEBOOK_PATH \
    --build-arg CLUSTER_ID \
    --build-arg RESULT_DATABASE \
    --build-arg RESULT_TABLE_NAME \
    --build-arg DATABRICKS_ACCOUNT_ID \
    --build-arg SLACK_CHANNEL_URL \
    --build-arg SLACK_CHANNEL_NAME
    "$service"
  docker-compose up -d "$service"
fi
