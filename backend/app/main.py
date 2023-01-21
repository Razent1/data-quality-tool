from fastapi import FastAPI, Request
from databricks import sql
import os
import requests
from fastapi.middleware.cors import CORSMiddleware

SERVER_HOST: str = os.environ['SERVER_HOST']
HTTP_PATH: str = os.environ['HTTP_PATH']
ACCESS_TOKEN: str = os.environ['TOKEN']
NOTEBOOK_PATH: str = os.environ["NOTEBOOK_PATH"]
CLUSTER_ID: str = os.environ["CLUSTER_ID"]
RESULT_DATABASE: str = os.environ["RESULT_DATABASE"]
RESULT_TABLE_NAME: str = os.environ["RESULT_TABLE_NAME"]

app = FastAPI(openapi_prefix=os.getenv('ROOT_PATH', ''))

origins = [
    "http://localhost:3000",
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def dbfs_rpc(action, body):
    """ A helper function to make the DBFS API request, request/response is encoded/decoded as JSON """
    response = requests.post(
        action,
        headers={'Authorization': 'Bearer %s' % ACCESS_TOKEN},
        json=body
    )
    return response.json()


def scheduler_parser(time, interval, repeats):
    """
    Convert parameters to cron syntax
    """

    hour, min = time.split(':')

    if interval == 'Every Hour':
        return f"0 {min} * * * ?"
    elif interval == 'Every Day':
        return f"0 {min} {hour} * * ?"
    elif interval == 'Every Month':
        return f"0 {min} {hour} 1 * ?"
    elif repeats['su'] or repeats['mo'] or repeats['tu'] or repeats['we'] or repeats['thu'] or repeats['fri'] or \
            repeats['sat']:
        days = [repeats['su'], repeats['mo'], repeats['tu'], repeats['we'], repeats['thu'], repeats['fri'],
                repeats['sat']]
        day_week_concat = ""
        for num_day, day in enumerate(days):
            if num_day == 0 and day:
                if day_week_concat == '':
                    day_week_concat += 'Sun'
                else:
                    day_week_concat += ',Sun'
            if num_day == 1 and day:
                if day_week_concat == '':
                    day_week_concat += 'Mon'
                else:
                    day_week_concat += ',Mon'
            if num_day == 2 and day:
                if day_week_concat == '':
                    day_week_concat += 'Tue'
                else:
                    day_week_concat += ',Tue'
            if num_day == 3 and day:
                if day_week_concat == '':
                    day_week_concat += 'Wed'
                else:
                    day_week_concat += ',Wed'
            if num_day == 4 and day:
                if day_week_concat == '':
                    day_week_concat += 'Thu'
                else:
                    day_week_concat += ',Thu'
            if num_day == 5 and day:
                if day_week_concat == '':
                    day_week_concat += 'Fri'
                else:
                    day_week_concat += ',Fri'
            if num_day == 6 and day:
                if day_week_concat == '':
                    day_week_concat += 'Sat'
                else:
                    day_week_concat += ',Sat'

        if day_week_concat != '':
            return f"0 {min} {hour} ? * {day_week_concat}"
    elif interval == 'Every Week':
        return f"0 {min} {hour} ? * Mon"
    else:
        return None


@app.get("/")
async def root(request: Request):
    return {"message": "Welcome to data quality tool API", "root_path": request.scope.get("root_path")}


@app.get("/databases", tags=["Tables"])
async def get_databases() -> list:
    """
    Get the databases from Databricks
    """
    connection = sql.connect(
        server_hostname=SERVER_HOST,
        http_path=HTTP_PATH,
        access_token=ACCESS_TOKEN)

    cursor = connection.cursor()

    cursor.execute("SHOW DATABASES")
    dbs = cursor.fetchall()
    res = []
    for db in dbs:
        res.extend(db)

    cursor.close()
    connection.close()
    return res


@app.post("/tables", tags=["tables"])
async def get_tables(db: dict) -> list:
    """
        Get Tables from db
    """

    connection = sql.connect(
        server_hostname=SERVER_HOST,
        http_path=HTTP_PATH,
        access_token=ACCESS_TOKEN)

    cursor = connection.cursor()

    cursor.execute(f"SHOW TABLES IN {db['db']}")

    tables = cursor.fetchall()
    cursor.close()
    connection.close()
    return [tbl[1] for tbl in tables]


@app.post("/columns", tags=["columns"])
async def get_columns(schema: dict):
    """
        Get columns from the table
    """

    connection = sql.connect(
        server_hostname=SERVER_HOST,
        http_path=HTTP_PATH,
        access_token=ACCESS_TOKEN
    )

    cursor = connection.cursor()

    cursor.execute(f"SHOW COLUMNS IN {schema['db']}.{schema['table']}")

    columns = cursor.fetchall()
    res = []
    for col in columns:
        res.extend(col)

    cursor.close()
    connection.close()
    return res


@app.post("/send_checker", tags=["send_job_info"])
async def send_checker(info: dict):
    """
       Send parameter for checker
    """

    checker_name: str = info["checkerName"]
    db_name: str = info["db"]
    table_name: str = info["table"]
    checkers: str = str(info["checker"])
    filtration_condition = info["filtrationCondition"]
    time: str = info["time"]
    interval: str = info["interval"]
    repeats: str = eval(str(info["repeats"]))
    columns_duplication: str = str(info["columns"])
    columns_nulls: str = str(info["nullColumns"])
    actuality: str = str(info["actuality"])
    period_actuality: str = str(info["periodActuality"])
    col_count_rows: str = str(info["rowColumn"])
    period_count_rows: str = str(info["periodRows"])
    col_data_outliers: str = str(info["dataOutliersColumn"])
    period_data_outliers: str = str(info["periodDataOutliers"])

    cron = scheduler_parser(time, interval, repeats)
    url_api = f'https://{SERVER_HOST}/api/2.1/jobs/create'
    body = {
        "name": checker_name,
        "tasks": [
            {
                "task_key": checker_name,
                "notebook_task": {
                    "notebook_path": NOTEBOOK_PATH,
                    "base_parameters": {
                        "db": db_name,
                        "table": table_name,
                        "checkers": checkers,
                        "filtration_condition": filtration_condition,
                        "columns_duplication": columns_duplication,
                        "columns_nulls": columns_nulls,
                        "actuality": actuality,
                        "period_actuality": period_actuality,
                        "col_count_rows": col_count_rows,
                        "period_count_rows": period_count_rows,
                        "col_data_outliers": col_data_outliers,
                        "period_data_outliers": period_data_outliers,
                        "checker_name": checker_name,
                        "cron": cron,
                        "result_table_name": f"{RESULT_DATABASE}.{RESULT_TABLE_NAME}",
                        "job_id": "{{job_id}}"
                    },
                    "source": "WORKSPACE"
                },
                "existing_cluster_id": CLUSTER_ID
            }],
        "schedule": {
            "quartz_cron_expression": f"{cron}",
            "timezone_id": "Europe/London"
        },
        "max_concurrent_runs": 1,
        "format": "MULTI_TASK",
    }

    response = await dbfs_rpc(url_api, body)

    return response


@app.get("/checker_results", tags=["checker_results"])
async def get_checker_results(page_num: int = 1, page_size: int = 5):
    """
    Get results from table from Databricks
    """

    start = (page_num - 1) * page_size
    end = start + page_size

    connection = sql.connect(
        server_hostname=SERVER_HOST,
        http_path=HTTP_PATH,
        access_token=ACCESS_TOKEN)

    cursor = connection.cursor()

    cursor.execute(f"""
    SELECT 
        name,
        id, 
        job_id,
        cron,
        result,  
        started_at,
        time_of_check,
        table_name,
        checker_type_name,
        values
    FROM {RESULT_DATABASE}.{RESULT_TABLE_NAME}
    ORDER BY started_at DESC""")

    result = cursor.fetchall()
    cursor.close()
    connection.close()

    res_len = len(result)

    response = {
        "data": result[start:end],
        "total": res_len,
        "count": page_size,
        "pagination": {}
    }

    if end >= res_len:
        response["pagination"]["next"] = None

        if page_num > 1:
            response["pagination"]["previous"] = f"/checker_results?page_num={page_num - 1}&page_size={page_size}"
        else:
            response["pagination"]["previous"] = None
    else:
        if page_num > 1:
            response["pagination"]["previous"] = f"/checker_results?page_num={page_num - 1}&page_size={page_size}"
        else:
            response["pagination"]["previous"] = None
        response["pagination"]["next"] = f"/checker_results?page_num={page_num + 1}&page_size={page_size}"

    return response
    # return result[start:end]


@app.post("/checker_history", tags=["checker_history"])
async def get_checker_history(job_id: dict):
    """
    Get history of runs of checker by id
    """

    connection = sql.connect(
        server_hostname=SERVER_HOST,
        http_path=HTTP_PATH,
        access_token=ACCESS_TOKEN)

    cursor = connection.cursor()

    cursor.execute(f"""
        SELECT
        id,
        job_id,
        started_at,
        result
        FROM {RESULT_DATABASE}.{RESULT_TABLE_NAME}
        WHERE job_id = {job_id["jobId"]} 
        ORDER BY started_at DESC
        LIMIT 10
    """)

    result = cursor.fetchall()
    cursor.close()
    connection.close()

    return result
