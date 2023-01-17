# Databricks notebook source
import re
import statistics
import json

from great_expectations.dataset.sparkdf_dataset import SparkDFDataset

from pyspark.sql.functions import mean, count, sum, to_date
from pyspark.sql import types as T

import pandas as pd

# COMMAND ----------

# MAGIC %run ./helper

# COMMAND ----------

# MAGIC %md
# MAGIC Take id from started Job

# COMMAND ----------

# Token for Databricks API
token = dbutils.secrets.get("SecretBucket", "API")

# Host link for API
host = dbutils.secrets.get("SecretBucket", "DatabricksHostName")

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

# COMMAND ----------

# MAGIC %md
# MAGIC Checkers for filtation conditions

# COMMAND ----------

if filtration_condition:
    df = spark.sql(f"SELECT * FROM {db}.{table} WHERE {filtation_condition}")
else:
    df = spark.read.table(f"{db}.{table}")    

# COMMAND ----------

#Resulting dict
res_checkers = {'duplication': None, 
                'null_colls': None, 
                'count_rows': None, 
                'actuality_simple': None, 
                'actuality_diff': None}

#Great expectations object for spark dataframe
gdf = SparkDFDataset(df)

# COMMAND ----------

def duplication_checker(columns_duplication: list):
    """
    Duplication checker
    """
    global gdf
    
    if len(columns_duplication) == 1:
        res = gdf.expect_column_values_to_be_unique(columns_duplication[0], result_format={'result_format': 'SUMMARY'})
    else:
        res = gdf.expect_multicolumn_values_to_be_unique(columns_duplication, result_format={'result_format': 'SUMMARY'})

    res["result"]["success"] = "Success" if res["success"] else "Failed"
    res["result"]["column"] = res["expectation_config"]["kwargs"]["column"]
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
        checked_colls.append({checking_coll: r["result"]})
    return checked_colls

# COMMAND ----------

def detect_outliers(data):
    """
    Function for deffine outliers of the data
    """
    data = sorted(data)

    # Compute the length of the data set
    n = len(data)

    # Compute the first and third quartiles
    if n % 2 == 0:
        Q1 = statistics.median(data[:n // 2])
        Q3 = statistics.median(data[n // 2:])
    else:
        Q1 = statistics.median(data[:n // 2])
        Q3 = statistics.median(data[n // 2 + 1:])

    # Compute the interquartile range
    IQR = Q3 - Q1

    # Compute the lower and upper bounds
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR

    # Identify any values that fall outside of the bounds as outliers
    outliers = [x for x in data if x < lower_bound or x > upper_bound]

    return outliers

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

    actuality_filtation = (
        (
            gdf.spark_df.where(
                f"to_date({actuality_simple_col}) >= current_date() - interval {period_actuality} day"
            )
            .select(to_date(f"{actuality_simple_col}"))
            .distinct()
        )
        .rdd.map(lambda x: x[0].strftime("%Y-%m-%d"))
        .collect()
    )
    last_day = SparkDFDataset(
        gdf.spark_df.where(
            f"to_date({actuality_simple_col}) = current_date() - interval 1 day"
        )
        .select(to_date(f"{actuality_simple_col}").alias("actual_date"))
        .distinct()
    )
    res = last_day.expect_column_values_to_be_in_set(
        "actual_date", actuality_filtation, result_format={"result_format": "SUMMARY"}
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
                        res_checkers=res_checkers,
                        job_start_time=job_start_time,
                        time_of_check=time_of_check,
                        db=db,
                        table=table,
                        result_table_name=result_table_name,
                        checker_type_name="duplication")
elif checkers["nullCols"]:
    columns_nulls = eval(dbutils.widgets.get("columns_nulls"))
    res_checkers["null_colls"] = null_colls_checker(columns_nulls)
    update_result_table(run_id=run_id,
                        job_id=job_id,
                        cron=cron,
                        checker_name=checker_name,
                        res_checkers=res_checkers,
                        job_start_time=job_start_time,
                        time_of_check=time_of_check,
                        db=db,
                        table=table,
                        result_table_name=result_table_name,
                        checker_type_name="null_colls")
elif checkers["countRows"]:
    col_count_rows = dbutils.widgets.get("col_count_rows")
    period_count_rows = dbutils.widgets.get("period_count_rows")
    res_checkers["count_rows"] = count_rows_checker(col_count_rows, period_count_rows)
    update_result_table(run_id=run_id,
                        job_id=job_id,
                        cron=cron,
                        checker_name=checker_name,
                        res_checkers=res_checkers,
                        job_start_time=job_start_time,
                        time_of_check=time_of_check,
                        db=db,
                        table=table,
                        result_table_name=result_table_name,
                        checker_type_name="count_rows")
elif checkers["actualitySimple"]:
    actuality_simple_col = eval(dbutils.widgets.get("actuality")["actualitySimple"])
    period_actuality = dbutils.widgets.get("period_actuality")
    res_checkers["actuality_simple"] = actuality_simple_checker(
        actuality_simple_col, period_actuality
    )
    update_result_table(run_id=run_id,
                        job_id=job_id,
                        cron=cron,
                        checker_name=checker_name,
                        res_checkers=res_checkers,
                        job_start_time=job_start_time,
                        time_of_check=time_of_check,
                        db=db,
                        table=table,
                        result_table_name=result_table_name,
                        checker_type_name="actuality_simple")
