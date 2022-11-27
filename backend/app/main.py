from fastapi import FastAPI
from datetime import datetime
from databricks import sql
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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




@app.get("/databases", tags=["Tables"])
async def get_databases() -> list:
    """
    Get the databases from Databricks
    """
    connection = sql.connect(
        server_hostname="dbc-18975113-1ba6.cloud.databricks.com",
        http_path="/sql/1.0/warehouses/33b05f27aa211816",
        access_token="dapifb287f87a839119fa623206a5c545a0d")

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
        Get Tables from choosing db
    """

    connection = sql.connect(
        server_hostname="dbc-18975113-1ba6.cloud.databricks.com",
        http_path="/sql/protocolv1/o/2520309401638937/0502-062208-z7pwtwc3",
        access_token="dapifb287f87a839119fa623206a5c545a0d")

    cursor = connection.cursor()

    cursor.execute(f"SHOW TABLES IN {db['db']}")

    tables = cursor.fetchall()
    cursor.close()
    connection.close()
    return [tbl[1] for tbl in tables]

