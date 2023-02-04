# data-quality-tool v0.0.1
## Overview
A data quality management tool written using JavaScript, Python, as well as using Databricks architectural solutions.
This project was created as part of the thesis, and is also partially implemented in the use of the processes of the company [Obligo](https://myobligo.com/).

## Project structure
 - [Frontend Part](https://github.com/Razent1/data-quality-tool/tree/master/frontend)
 - [Backend Part](https://github.com/Razent1/data-quality-tool/tree/master/backend)
 - [Databricks Part](https://github.com/Razent1/data-quality-tool/tree/master/databricks_notebooks)

## Installation
To implement this tool, you need a Databricks account, as well as a pre-installed docker.
You should put the files from databricks_notebooks in a directory convenient for you in your Databricks account.

!ATTENTION! 

The tool is still working in test mode at the time of writing the thesis and was created for the needs of a specific organization. Despite the fact that this technology can be used by other users, it is not recommended to use it in Prodoction

## Launch Instructions
1) For starting the environment, firstly you should change the right part of environment variables in the script start.sh.
```export SERVER_HOST=<databricks-host>
export HTTP_PATH=<databricks-http-path>
export NOTEBOOK_PATH=<databricks-notebook-path>
export CLUSTER_ID=<databricks-cluster-id>
export RESULT_DATABASE=<databricks-result-database>
export RESULT_TABLE_NAME=<databricks-result-table>
export DATABRICKS_ACCOUNT_ID=<databricks-account-id>
export SLACK_CHANNEL_URL=<slack-channel-url>
export SLACK_CHANNEL_NAME=<slack-channel-name>
export JIRA_TOKEN=<jira-token>
export JIRA_URL=<jira-url>
export JIRA_PROJECT_ID=<jira-project-id>
```
2) Write the command in the Terminal - 'bash start.sh'. If you want to build only one service, you should write the command in a such a way - 'bash start.sh <name-of-service>'.
3) After deploying is finishing, you are going to see two containers: 'frontend' and 'backend'. For accessing to frontend you should follow a link 'http://localhost:8080/'.
For accessing backend - 'http://localhost:8000/'. Generally only what you need - the access to fronted, since all endpoints from backend are integrated there.

!ATTENTION!

It is recommended to replace in the notebook code (commented part with secrets) the logic of obtaining all tokens and keys through Databricks Secrets (for your safety)