import pandas as pd
from sklearn.ensemble import IsolationForest

def detect_cost_anomalies():
    df = pd.read_csv("cloud_usage.csv")

    # Use cost only for anomaly detection
    cost_data = df[["cost"]]

    model = IsolationForest(
        contamination=0.1,
        random_state=42
    )

    df["anomaly"] = model.fit_predict(cost_data)

    # -1 means anomaly
    anomalies = df[df["anomaly"] == -1]

    results = []

    for _, row in anomalies.iterrows():
        results.append({
            "timestamp": row["timestamp"],
            "resource_id": row["resource_id"],
            "cost": row["cost"]
        })

    return results
