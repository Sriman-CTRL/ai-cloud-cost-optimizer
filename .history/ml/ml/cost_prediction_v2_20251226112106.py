import pandas as pd
from sklearn.linear_model import LinearRegression

def predict_cost_with_resources():
    df = pd.read_csv("cloud_usage.csv")

    # Features (X) and target (y)
    X = df[[
        "cpu_usage",
        "memory_usage",
        "network_gb",
        "storage_gb"
    ]]

    y = df["cost"]

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Use latest resource usage to predict next cost
    latest = X.tail(1)

    prediction = model.predict(latest)

    return round(float(prediction[0]), 2)
