# Databricks notebook source
from databricks_api import DatabricksAPI
from datetime import date, timedelta, datetime

# COMMAND ----------

def db_api(host, token):
    return DatabricksAPI(
    host=host,
    token=token
)

# COMMAND ----------

class DB_Api:
    
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

def update_result_table(run_id: str, 
                        job_id: dict, 
                        checker_name: str, 
                        cron: str, 
                        res_checkers: dict, 
                        job_start_time: str, 
                        time_of_check: float, 
                        db: str, 
                        table: str,
                        result_table_name: str,
                        checker_type_name: str) -> None:
    spark.createDataFrame(
    [
        (checker_name, 
        int(run_id), 
        int(job_id['job_id']), 
        cron, 
        res_checkers[f'{checker_type_name}']["success"], 
        job_start_time.strftime("%d/%m/%Y,%H:%M:%S"), 
        time_of_check, 
        f"{db}.{table}",
        checker_type_name,
        res_checkers[f'{checker_type_name}'])
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
