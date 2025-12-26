import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def predict_tomorrow_cost():
    # Load data
    df = pd.read_csv("cloud_usage.csv")

    # Convert timestamp to datetime
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    # Group by date and sum cost
    daily_cost = df.groupby(df["timestamp"].dt.date)["cost"].sum().reset_index()

    # Prepare ML features
    X = np.arange(len(daily_cost)).reshape(-1, 1)  # day index
    y = daily_cost["cost"].values

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Predict next day
    next_day = np.array([[len(daily_cost)]])
    prediction = model.predict(next_day)

    return round(float(prediction[0]), 2)
