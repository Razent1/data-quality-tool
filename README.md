1) For starting the environment, firstly you should change the right part of environment variables in the script start.sh.
export SERVER_HOST=<databricks-host>
export HTTP_PATH=<databricks-http-path>
export NOTEBOOK_PATH=<databricks-notebook-path>
export CLUSTER_ID=<databricks-cluster-id>
export RESULT_DATABASE=<databricks-result-database>
export RESULT_TABLE_NAME=<databricks-result-table>
export DATABRICKS_ACCOUNT_ID=<databricks-account-id>
2) Write the command in the Terminal - 'bash start.sh'. If you want to build only one service, you should write the command in a such a way - 'bash start.sh <name-of-service>'.
3) After deploying is finishing, you are going to see two containers: 'frontend' and 'backend'. For accessing to frontend you should follow a link 'http://localhost:8080/'.
For accessing backend - 'http://localhost:8000/'. Generally only what you need - the access to fronted, since all endpoints from backend are integrated there.