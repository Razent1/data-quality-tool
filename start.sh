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
#export JIRA_TOKEN=<jira-token>
#export JIRA_URL=<jira-url>
#export JIRA_PROJECT_ID=<jira-project-id>
#export GIT_URL=<git-url>

export TOKEN=dapifb287f87a839119fa623206a5c545a0d
export SERVER_HOST=dbc-18975113-1ba6.cloud.databricks.com
export HTTP_PATH=/sql/1.0/warehouses/33b05f27aa211816
export NOTEBOOK_PATH=/Users/ilya.rozentul@myobligo.com/diplom/checker
export CLUSTER_ID=0502-062208-z7pwtwc3
export RESULT_DATABASE=streaming_logs
export RESULT_TABLE_NAME=data_quality_checks
export DATABRICKS_ACCOUNT_ID=2520309401638937
export SLACK_CHANNEL_URL=https://hooks.slack.com/services/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
export SLACK_CHANNEL_NAME=activity-data-quality
export JIRA_TOKEN=ATATT3xFfGF0FVGe4t9gvh5lrPTfIiiESkwatAV7wf9m1ugO8_4VdYv7JGNzNxOaUfkz_F3kwJnvxiCOUWlqypLSlxXrcL6EcTEW3hHangPIznGEiYNg7Wn7Uf8ib2i2DapDmjWScWFVGu3owpvNX0aSzpKGfkXnaA70XfzEwZJamMPUnqO5Rug=CD89F3DC
export JIRA_URL=https://obligo.atlassian.net/rest/api/3/issue/
export JIRA_PROJECT_ID=10017
export GIT_URL=https://gitlab.com/obligo/data.git

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
  --build-arg SLACK_CHANNEL_NAME \
  --build-arg JIRA_TOKEN \
  --build-arg JIRA_URL \
  --build-arg JIRA_PROJECT_ID \
  --build-arg GIT_URL
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
    --build-arg SLACK_CHANNEL_NAME \
    --build-arg JIRA_TOKEN \
    --build-arg JIRA_URL \
    --build-arg JIRA_PROJECT_ID \
    --build-arg GIT_URL
    "$service"
  docker-compose up -d "$service"
fi
