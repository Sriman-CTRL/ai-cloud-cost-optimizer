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


@app.get("/waste")
def get_waste():
    COST_PER_HOUR = 5
    idle_servers = {}

    with open("cloud_usage.csv", "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            cpu = float(row["cpu_usage"])
            server = row["resource_id"]

            if cpu < 10:
                idle_servers[server] = idle_servers.get(server, 0) + 1

    result = []
    for server, hours in idle_servers.items():
        result.append({
            "resource_id": server,
            "idle_hours": hours,
            "money_wasted": hours * COST_PER_HOUR
        })

    return result
