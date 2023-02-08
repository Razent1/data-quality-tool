# Databricks notebook source
# MAGIC %pip install great_expectations

# COMMAND ----------

# MAGIC %pip install databricks_api

# COMMAND ----------

import re
import statistics
import json

from great_expectations.dataset.sparkdf_dataset import SparkDFDataset

from pyspark.sql.functions import mean, count, sum, to_date, expr
from pyspark.sql import types as T

import pandas as pd

# COMMAND ----------

# MAGIC %run ./helper

# COMMAND ----------

# MAGIC %md
# MAGIC Take id from started Job

# COMMAND ----------

# Token for Databricks API
token = dbutils.widgets.get("databricks_token")
#If you use Databricks secrets
# token = dbutils.secrets.get("SecretBucket", "API")

# Host link for API
host = dbutils.widgets.get("databricks_host")
#If you use Databricks secrets
# host = dbutils.secrets.get("YourSecretBucket", "DatabricksHostName")

# Id of the run
run_id = (
    dbutils.notebook.entry_point.getDbutils()
    .notebook()
    .getContext()
    .currentRunId()
    .toString()
)
run_id = re.findall("\d+", run_id)[0]

# Call Databricks API to save information about starting and finishing of the job
db_api = DB_Api(host=host,  
            token=token, 
            run_id=run_id)
job_start_time = db_api.get_run_start_time()
job_id = db_api.get_job()

# COMMAND ----------

# MAGIC %md
# MAGIC Take enviroment variables from backend

# COMMAND ----------

db = dbutils.widgets.get("db")
table = dbutils.widgets.get("table")
checkers = eval(dbutils.widgets.get("checkers"))
filtration_condition = dbutils.widgets.get("filtration_condition")
checker_name = dbutils.widgets.get("checker_name")
cron = dbutils.widgets.get("cron")
result_table_name = dbutils.widgets.get("result_table_name")
slack_channel_url = dbutils.widgets.get("slack_channel_url")
slack_channel_name = dbutils.widgets.get("slack_channel_name")
jira_url = dbutils.widgets.get("jira_url")
jira_project_id = dbutils.widgets.get("jira_project_id")
jira_token = dbutils.widgets.get("jira_token")
#If you use Databricks secrets
# jira_token = dbutils.secrets.get("YourSecretBucket", "JiraAccessToken")

# COMMAND ----------

# MAGIC %md
# MAGIC Checkers for filtration conditions

# COMMAND ----------

if filtration_condition:
    try:
        df = spark.sql(f"SELECT * FROM {db}.{table} WHERE {filtration_condition}")
    except:
        df = spark.read.table(f"{db}.{table}") 
else:
    df = spark.read.table(f"{db}.{table}")    

# COMMAND ----------

#Resulting dict
res_checkers = {'duplication': None, 
                'null_colls': None, 
                'count_rows': None, 
                'actuality_simple': None, 
                'actuality_diff': None,
                'data_outliers': None}

#Great expectations object for spark dataframe
gdf = SparkDFDataset(df)

# COMMAND ----------

def duplication_checker(columns_duplication: list):
    """
    Duplication checker
    """
    global gdf
    
    res = gdf.expect_compound_columns_to_be_unique(columns_duplication, result_format={'result_format': 'SUMMARY'})

    res["result"]["success"] = "Success" if res["success"] else "Failed"
    res["result"]["column"] = res["expectation_config"]["kwargs"]["column_list"]
    del res["result"]["partial_unexpected_index_list"]
    del res["result"]["partial_unexpected_list"]
    del res["result"]["partial_unexpected_counts"]
    return res["result"]

# COMMAND ----------

def null_colls_checker(columns_nulls: list):
    """
    Null in columns checker
    """
    global gdf
    checked_colls = []
    
    for checking_coll in columns_nulls:
        r = gdf.expect_column_values_to_not_be_null(checking_coll, result_format={'result_format': 'SUMMARY'})
        r["result"]["success"] = "Success" if r["success"] else "Failed"
        r["result"]["column"] = r["expectation_config"]["kwargs"]["column"]
        del r["result"]["partial_unexpected_list"]
        del r["result"]["partial_unexpected_index_list"]
        checked_colls.append(r["result"])
    return checked_colls

# COMMAND ----------

def data_outliers_checker(col_count_outliers: str, period_count_outliers: str):
    """
    Outliers checker
    """
    global gdf

    mean_filtration = (
        (
            gdf.spark_df.groupBy(to_date(f"{col_count_outliers}"))
            .agg(count("*").alias("rows_per_day"))
            .where(
                f"to_date({col_count_outliers}) >= current_date() - interval {period_count_outliers} day"
            )
            .select("rows_per_day")
        )
        .rdd.map(lambda x: x[0])
        .collect()
    )

    data = sorted(mean_filtration)

    n = len(data)

    if n % 2 == 0:
        Q1 = statistics.median(data[:n // 2])
        Q3 = statistics.median(data[n // 2:])
    else:
        Q1 = statistics.median(data[:n // 2])
        Q3 = statistics.median(data[n // 2 + 1:])

    IQR = Q3 - Q1

    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR

    outliers = [x for x in data if x < lower_bound or x > upper_bound]

    res = {"outliers": outliers, 
            "count_outliers": len(outliers), 
            "success": "Success" if len(outliers) == 0 else "Failed", 
            "column": col_count_outliers}

    return res

# COMMAND ----------

def count_rows_checker(col_count_rows: str, period_count_rows: str):
    """
    Count of rows checker
    """
    global gdf

    mean_filtration = (
        (
            gdf.spark_df.groupBy(to_date(f"{col_count_rows}"))
            .agg(count("*").alias("rows_per_day"))
            .where(
                f"to_date({col_count_rows}) >= current_date() - interval {period_count_rows} day"
            )
            .select("rows_per_day")
        )
        .rdd.map(lambda x: x[0])
        .collect()
    )

    # Using algorithm of one Standard Deviation
    mean = statistics.mean(mean_filtration)
    std = statistics.stdev(mean_filtration)
    upper_boundary = int(mean + std)
    lower_boundary = int(mean - std)
    last_day = SparkDFDataset(
        gdf.spark_df.where(
            f"to_date({col_count_rows}) = current_date() - interval 1 day"
        )
    )
    res = last_day.expect_table_row_count_to_be_between(
        min_value=lower_boundary,
        max_value=upper_boundary,
        result_format={"result_format": "SUMMARY"},
    )
    res["result"]["success"] = "Success" if res["success"] else "Failed"
    res["result"]["column"] = col_count_rows
    res["result"]["min_value"] = res["expectation_config"]["kwargs"]["min_value"]
    res["result"]["max_value"] = res["expectation_config"]["kwargs"]["max_value"]
    return res["result"]

# COMMAND ----------

def actuality_simple_checker(actuality_simple_col: str, period_actuality: str):
    """
    Checker of simple actuality
    """
    global gdf

    gdf.spark_df.createOrReplaceTempView(f"actuality")
    actuality_filtation = SparkDFDataset(spark.sql(f"""
                                    SELECT 
                                    COUNT(DISTINCT to_date({actuality_simple_col}, 'yyyy-MM-dd')) AS {actuality_simple_col} 
                                    FROM actuality
                                    WHERE to_date({actuality_simple_col}) > current_date() - interval {period_actuality} day"""))

    res = actuality_filtation.expect_column_values_to_be_in_set(
        actuality_simple_col, [period_actuality], result_format={"result_format": "SUMMARY"}
    )
    res["result"]["success"] = "Success" if res["success"] else "Failed"
    res["result"]["column"] = res["expectation_config"]["kwargs"]["column"]
    del res["result"]["partial_unexpected_list"]
    del res["result"]["partial_unexpected_index_list"]
    del res["result"]["partial_unexpected_counts"]
    return res["result"]

# COMMAND ----------

job_finish_time = (datetime.now() + timedelta(hours=3))
time_of_check = (job_finish_time - job_start_time).total_seconds()

# COMMAND ----------

if checkers["duplication"]:
    columns_duplication = eval(dbutils.widgets.get("columns_duplication"))
    res_checkers["duplication"] = duplication_checker(columns_duplication)
    update_result_table(run_id=run_id,
                        job_id=job_id,
                        cron=cron,
                        checker_name=checker_name,
                        succcess_result=res_checkers["duplication"]["success"],
                        checker_final_parametrs=res_checkers["duplication"],
                        job_start_time=job_start_time,
                        time_of_check=time_of_check,
                        db=db,
                        table=table,
                        result_table_name=result_table_name,
                        checker_type_name="duplication",
                        slack_channel_url=slack_channel_url,
                        slack_channel_name=slack_channel_name,
                        jira_url=jira_url,
                        jira_token=jira_token,
                        jira_project_id=jira_project_id)
if checkers["nullCols"]:
    columns_nulls = eval(dbutils.widgets.get("columns_nulls"))
    res_checkers["null_colls"] = null_colls_checker(columns_nulls)
    for col_checker in res_checkers["null_colls"]:
        update_result_table(run_id=run_id,
                            job_id=job_id,
                            cron=cron,
                            checker_name=checker_name,
                            succcess_result=col_checker["success"],
                            checker_final_parametrs=col_checker,
                            job_start_time=job_start_time,
                            time_of_check=time_of_check,
                            db=db,
                            table=table,
                            result_table_name=result_table_name,
                            checker_type_name="null_colls",
                            slack_channel_url=slack_channel_url,
                            slack_channel_name=slack_channel_name,
                            jira_url=jira_url,
                            jira_token=jira_token,
                            jira_project_id=jira_project_id)
if checkers["countRows"]:
    col_count_rows = dbutils.widgets.get("col_count_rows")
    period_count_rows = dbutils.widgets.get("period_count_rows")
    res_checkers["count_rows"] = count_rows_checker(col_count_rows, period_count_rows)
    update_result_table(run_id=run_id,
                        job_id=job_id,
                        cron=cron,
                        checker_name=checker_name,
                        succcess_result=res_checkers["count_rows"]["success"],
                        checker_final_parametrs=res_checkers["count_rows"],
                        job_start_time=job_start_time,
                        time_of_check=time_of_check,
                        db=db,
                        table=table,
                        result_table_name=result_table_name,
                        checker_type_name="count_rows",
                        slack_channel_url=slack_channel_url,
                        slack_channel_name=slack_channel_name,
                        jira_url=jira_url,
                        jira_token=jira_token,
                        jira_project_id=jira_project_id)
if checkers["actualitySimple"]:
    actuality_simple_col = eval(dbutils.widgets.get("actuality"))['actualitySimple']
    period_actuality = dbutils.widgets.get("period_actuality")
    res_checkers["actuality_simple"] = actuality_simple_checker(
        actuality_simple_col, period_actuality
    )
    update_result_table(run_id=run_id,
                        job_id=job_id,
                        cron=cron,
                        checker_name=checker_name,
                        succcess_result=res_checkers["actuality_simple"]["success"],
                        checker_final_parametrs=res_checkers["actuality_simple"],
                        job_start_time=job_start_time,
                        time_of_check=time_of_check,
                        db=db,
                        table=table,
                        result_table_name=result_table_name,
                        checker_type_name="actuality_simple",
                        slack_channel_url=slack_channel_url,
                        slack_channel_name=slack_channel_name,
                        jira_url=jira_url,
                        jira_token=jira_token,
                        jira_project_id=jira_project_id)
if checkers["dataOutliers"]:
    col_data_outliers = dbutils.widgets.get("col_data_outliers")
    period_data_outliers = dbutils.widgets.get("period_data_outliers")
    res_checkers["data_outliers"] = data_outliers_checker(
        col_data_outliers, period_data_outliers
    )
    update_result_table(run_id=run_id,
                        job_id=job_id,
                        cron=cron,
                        checker_name=checker_name,
                        succcess_result=res_checkers["data_outliers"]["success"],
                        checker_final_parametrs=res_checkers["data_outliers"],
                        job_start_time=job_start_time,
                        time_of_check=time_of_check,
                        db=db,
                        table=table,
                        result_table_name=result_table_name,
                        checker_type_name="data_outliers",
                        slack_channel_url=slack_channel_url,
                        slack_channel_name=slack_channel_name,
                        jira_url=jira_url,
                        jira_token=jira_token,
                        jira_project_id=jira_project_id)
