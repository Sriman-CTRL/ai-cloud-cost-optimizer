from fastapi.middleware.cors import CORSMiddleware
from ml.cost_prediction import predict_tomorrow_cost
from ml.anomaly_detection import detect_cost_anomalies
from ml.anomaly_explainer import explain_anomaly
from recommendations import generate_recommendation
from collections import defaultdict
from fastapi import FastAPI
import csv

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_waste():
    # Load raw usage data (same data you already use)
    usage_data = load_usage_data()  # <-- you already have this or inline data

    usage_by_resource = defaultdict(list)

    for row in usage_data:
        usage_by_resource[row["resource_id"]].append(row)

    waste_results = []

    for resource_id, data in usage_by_resource.items():
        idle_hours = sum(1 for r in data if r["cpu"] < 10)
        money_wasted = idle_hours * 5  # same logic you already used

        if idle_hours > 0:
            waste_results.append({
                "resource_id": resource_id,
                "idle_hours": idle_hours,
                "money_wasted": money_wasted
            })

    return waste_results

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
    return calculate_waste()



@app.get("/cost-summary")
def cost_summary():
    COST_PER_HOUR = 5
    total_cost = 0
    wasted_cost = 0
    idle_hours = {}

    with open("cloud_usage.csv", "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            cost = float(row["cost"])
            cpu = float(row["cpu_usage"])
            server = row["resource_id"]

            total_cost += cost

            if cpu < 10:
                idle_hours[server] = idle_hours.get(server, 0) + 1

    for server, hours in idle_hours.items():
        wasted_cost += hours * COST_PER_HOUR

   

    return {
    "total_cost_today": total_cost,
    "money_wasted": wasted_cost,
    "predicted_cost_tomorrow": predict_tomorrow_cost()
}



@app.get("/predict-cost")
def predict_cost():
    prediction = predict_tomorrow_cost()
    return {
        "predicted_cost": prediction
    }


@app.get("/anomalies")
def get_anomalies():
    anomalies = detect_cost_anomalies()

    explained = []

    for a in anomalies:
        avg_cost = 5  # simple baseline (hourly average in your data)
        explained.append(explain_anomaly(a, avg_cost))

    return explained


@app.get("/recommendations")
def recommendations():
    waste_data = calculate_waste()
    output = []

    for item in waste_data:
        rec = generate_recommendation(item)
        output.append({**item, **rec})

    return output