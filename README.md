# Nimbly — AI Cloud Cost Optimizer

Nimbly is a cloud cost intelligence dashboard built with React and FastAPI. It brings hourly spend, cost forecasts, idle-resource waste, anomaly alerts, and optimization recommendations into one place.

> **Project status:** This is a demo application using the included sample cloud-usage dataset. Its savings estimates and anomaly explanations are illustrative, not billing advice.

## What it does

- Summarizes recorded cloud spend and estimated idle-resource waste.
- Forecasts the next day's cost with a linear regression model.
- Flags unusual hourly spend using Isolation Forest.
- Suggests actions for underutilized resources.
- Displays the results in a responsive dashboard with spend trends and alerts.

## Stack

- **Frontend:** React 19, Vite, Recharts
- **API:** FastAPI, Uvicorn
- **Analysis:** pandas, NumPy, scikit-learn
- **Data:** `cloud_usage.csv`

## Run locally

### 1. Start the API

From the repository root, create and activate a virtual environment, then install the Python dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Interactive API docs are at `http://127.0.0.1:8000/docs`.

### 2. Start the dashboard

In a second terminal:

```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL = "http://127.0.0.1:8000"
npm run dev
```

Open the local URL printed by Vite. If `VITE_API_BASE_URL` is not set, the frontend uses the hosted demo API at `https://ai-cloud-cost-optimizer.onrender.com`.

## API endpoints

| Endpoint | Description |
| --- | --- |
| `GET /` | API health message |
| `GET /usage` | Hourly usage records from the CSV |
| `GET /cost-summary` | Total spend, estimated waste, and tomorrow's forecast |
| `GET /predict-cost` | Tomorrow's cost forecast |
| `GET /waste` | Resources with low CPU utilization |
| `GET /anomalies` | Unusual spend with a suggested explanation |
| `GET /recommendations` | Suggested optimization actions and estimated savings |

## Checks

```powershell
cd frontend
npm run lint
npm run build
```

## Repository layout

```text
.
├── cloud_usage.csv
├── main.py
├── recommendations.py
├── ml/
│   ├── anomaly_detection.py
│   ├── anomaly_explainer.py
│   └── cost_prediction.py
└── frontend/
    ├── src/
    └── package.json
```
