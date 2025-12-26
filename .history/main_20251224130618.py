from fastapi import FastAPI
import csv

app = FastAPI()

@app.get("/")
def root():
    return {"message": "AI Cloud Cost Optimizer backend is running"}

@app.get("/usage")
def get_usage():
    data = []

    with open("cloud_usage.csv", "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)

    return data
