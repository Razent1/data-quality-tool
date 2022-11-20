from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/day", tags=["Dates"])
def get_day_of_week():
    """
    Get the current day of week
    """
    return datetime.now().strftime("%A")