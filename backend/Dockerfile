FROM python:3.9
WORKDIR /code
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONBUFFERED 1
ENV TOKEN=dapifb287f87a839119fa623206a5c545a0d
ENV SERVER_HOST=dbc-18975113-1ba6.cloud.databricks.com
ENV HTTP_PATH=/sql/1.0/warehouses/33b05f27aa211816
ENV NOTEBOOK_PATH=/Users/ilya.rozentul@myobligo.com/diplom/checker
ENV CLUSTER_ID=0502-062208-z7pwtwc3
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY ./app /code/app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]