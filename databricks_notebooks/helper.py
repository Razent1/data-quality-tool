# Databricks notebook source
from databricks_api import DatabricksAPI
from datetime import date, timedelta, datetime

import json
import sys
import random
import requests

from pyspark.sql.functions import first

# COMMAND ----------

def db_api(host, token):
    return DatabricksAPI(
    host=host,
    token=token
)

# COMMAND ----------

class DB_Api:

    """
    Class for working with Databricks API
    """
    
    def __init__(self, host: str, token: str, run_id = None):
        self.db = DatabricksAPI(host=host, token=token)
        self.run_id = run_id
        self.job_id = self.get_run()['job_id']
    
    
    def get_run(self):
        return self.db.jobs.get_run(run_id=self.run_id, headers=None, version=None)
    
    
    def get_job(self):
        return self.db.jobs.get_job(job_id=self.job_id, headers=None, version=None)
    
    
    def get_run_start_time(self) -> str:
        return (datetime.fromtimestamp(self.get_run()['start_time'] / 1000) + timedelta(hours=3))
    
    
    def get_run_finish_time(self, time_format: str) -> str:
        return (datetime.fromtimestamp(self.get_run()['end_time'] / 1000) + timedelta(hours=3)).strftime(time_format)
    
    
    def get_job_name(self) -> str:
        return self.get_job()['settings']['name']
      
    
    def delete_job(self) -> str:
        return self.db.jobs.delete_job(self.job_id)

# COMMAND ----------

class Slack:
    """
    Class for working with Slack channels
    """
    
    def __init__(self, webhook_url, message, title, color, channel, img=''):
        self.webhook_url = webhook_url
        self.message = message
        self.title = title
        self.color = color
        self.channel = channel
        self.img = img
        
    
    def send_message(self):
        if self.img == '':
            slack_data = {
            "username": "NotificationBot",
            "icon_emoji": ":satellite:",
            "channel" : self.channel,
            "attachments": [
                {
                    "color": self.color,
                    "fields": [
                        {
                            "title": self.title,
                            "value": self.message,
                            "short": "false",
                        }
                    ]
                }
            ]}
        else:    
            slack_data = {
                "username": "NotificationBot",
                "icon_emoji": ":satellite:",
                "channel" : self.channel,

                "blocks": [
                    {
                        "type": "divider"
                    },        
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": f"{self.title}",
                            "emoji": True
                        }
                    },       
                    {
                        "type": "section",
                        "block_id": "section567",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"{self.message}"
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": f"{self.img}",
                            "alt_text": f"{self.title}"
                        }
                    },
                    {
                        "type": "divider"
                    }
                ]
            }
        
        byte_length = str(sys.getsizeof(slack_data))
        headers = {'Content-Type': "application/json", 'Content-Length': byte_length}
        response = requests.post(self.webhook_url, data=json.dumps(slack_data), headers=headers)
        if response.status_code != 200:
            raise Exception(response.status_code, response.text)

# COMMAND ----------

class Jira:

    """
    Class for working with Jira
    """

    def __init__(self, project_id, summery, issue_type, priority, url, token):
        self.project_id = project_id
        self.summery = summery
        self.issue_type = issue_type
        self.priority = priority
        self.url = url
        self.token = token

    
    def create_ticket(self):
        jira_data = {
            "fields": {
               "project":
               {
                  "id": self.project_id
               },
               "summary": self.summery,
               "issuetype": {
                  "name": self.issue_type
               },
               "priority": {
                   "name": self.priority
               }
           }
        }        
        headers = {'Content-Type': "application/json", 'Authorization': 'Basic ' + self.token}
        response = requests.post(self.url, data=json.dumps(jira_data), headers=headers)
        if response.status_code not in (200, 201):
            raise Exception(response.status_code, response.text)
        return json.loads(response.text)

# COMMAND ----------

def update_dashboard_info(db: str, table_name: str) -> None:
    dates = spark.sql(f"""WITH last_checks AS (
        SELECT MAX(name) name, 
                        to_timestamp(started_at, 'dd/MM/yyyy,HH:mm:ss') checker_date 
            FROM {db}.{table_name}
        GROUP BY to_timestamp(started_at, 'dd/MM/yyyy,HH:mm:ss')
       )
       SELECT * FROM (
       SELECT CONCAT(dc.name, '(', COALESCE(values.column, ''), ')') name,
                       to_date(last_checks.checker_date) AS checker_date,
                       dc.result,
                       CONCAT(ROUND(IF(dc.checker_type_name in ('null_colls', 'actuality_simple', 'duplication'), values.unexpected_percent_total, IF(result = 'Failed', 100, 0)), 2), '%') perc_failed_or_success
       FROM last_checks
       INNER JOIN {db}.{table_name} dc ON last_checks.checker_date = to_timestamp(started_at, 'dd/MM/yyyy,HH:mm:ss'))""")

    (dates
            .groupBy("name")
            .pivot("checker_date")
            .agg(first("perc_failed_or_success"))
            .write
            .mode("overwrite")
            .option("mergeSchema", "true")
            .format("delta")
            .saveAsTable(f"{db}.dashboard_quality_checks_{table_name}"))

# COMMAND ----------

def update_result_table(run_id: str, 
                        job_id: dict, 
                        checker_name: str, 
                        cron: str, 
                        succcess_result: str,
                        checker_final_parametrs: dict,
                        job_start_time: str, 
                        time_of_check: float, 
                        db: str, 
                        table: str,
                        result_table_name: str,
                        checker_type_name: str,
                        slack_channel_url: str,
                        slack_channel_name: str,
                        jira_url: str,
                        jira_token: str,
                        jira_project_id) -> None:
    channel = slack_channel_name
    url = slack_channel_url
    title = f"Checker {checker_name} was finished"

    spark.createDataFrame(
    [
        (checker_name, 
        int(run_id), 
        int(job_id['job_id']), 
        cron, 
        succcess_result,
        job_start_time.strftime("%d/%m/%Y,%H:%M:%S"), 
        time_of_check, 
        f"{db}.{table}",
        checker_type_name,
        checker_final_parametrs)
    ],
    """name string, 
        id bigint, 
        job_id bigint, 
        cron string, 
        result string, 
        started_at string, 
        time_of_check double, 
        table_name string,
        checker_type_name string, 
        values map<string, string>""").createOrReplaceTempView(f"{checker_type_name}")

    if spark._jsparkSession.catalog().tableExists(result_table_name):
        spark.sql(f"""INSERT INTO {result_table_name}
                    SELECT * FROM {checker_type_name}""")
    else:
        spark.sql(f"""CREATE TABLE {result_table_name} AS
                    SELECT * FROM {checker_type_name}""")

    #updating data on dashboard
    db_dash, table_dash = result_table_name.split('.')
    update_dashboard_info(db_dash, table_dash)

    slack_msg = f"*Result of check*: {succcess_result}\n\n *Type of check*: {checker_type_name}\n\n *Checked Table*: {db}.{table}\n\n *Time of check*: {time_of_check}\n\n"
    color = "red" if succcess_result == "Failed" else "green"
    img_url = "https://www.freeiconspng.com/uploads/tick-icon-16.png" if succcess_result == "Success" else "https://cdn-icons-png.flaticon.com/512/3588/3588294.png"
    Slack(url, slack_msg, title, color, channel, img_url).send_message()
    if succcess_result == "Failed":
        summery = f"Data quality problem in table {db}.{table}. Checker type: {checker_type_name}"
        Jira(jira_project_id, summery, "[System] Incident", "Medium", jira_url, jira_token).create_ticket()
