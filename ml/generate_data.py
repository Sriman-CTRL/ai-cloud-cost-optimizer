import csv
from datetime import datetime, timedelta

cost_per_hour = 5

start_time = datetime(2025, 1, 1, 0, 0)

rows = []

for hour in range(24):
    time = start_time + timedelta(hours=hour)

    # Idle server (waste)
    rows.append([
        time.strftime("%Y-%m-%d %H:%M"),
        "vm-idle",
        3,          # cpu
        10,         # memory
        0.05,       # network
        50,
        cost_per_hour
    ])

    # Busy server (useful)
    rows.append([
        time.strftime("%Y-%m-%d %H:%M"),
        "vm-busy",
        70,
        65,
        2.0,
        100,
        cost_per_hour
    ])

    # Spike server
cpu = 20 if hour < 12 else 90
dynamic_cost = cost_per_hour if cpu < 80 else cost_per_hour * 3

rows.append([
    time.strftime("%Y-%m-%d %H:%M"),
    "vm-spike",
    cpu,
    40,
    1.5,
    80,
    dynamic_cost
])


with open("cloud_usage.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow([
        "timestamp",
        "resource_id",
        "cpu_usage",
        "memory_usage",
        "network_gb",
        "storage_gb",
        "cost"
    ])
    writer.writerows(rows)
print("\n--- Waste Detection Report ---")

idle_servers = {}

with open("cloud_usage.csv", "r") as file:
    reader = csv.DictReader(file)

    for row in reader:
        cpu = float(row["cpu_usage"])
        server = row["resource_id"]

        if cpu < 10:
            idle_servers[server] = idle_servers.get(server, 0) + 1

for server, hours in idle_servers.items():
    print(f"⚠️ {server} is underutilized for {hours} hours")
print("\n--- Cost Waste Report ---")

COST_PER_HOUR = 5

for server, hours in idle_servers.items():
    wasted_money = hours * COST_PER_HOUR
    print(f"💸 {server} wasted ₹{wasted_money} due to low usage")
print("\n--- Cost Spike Detection ---")

previous_cost = None

with open("cloud_usage.csv", "r") as file:
    reader = csv.DictReader(file)

    for row in reader:
        current_cost = float(row["cost"])
        timestamp = row["timestamp"]

        if previous_cost is not None:
            if current_cost > 1.5 * previous_cost:
                print(f"🚨 Cost spike detected at {timestamp}: ₹{current_cost}")

        previous_cost = current_cost

    print("\n--- Cost Prediction (Simple Forecast) ---")

total_today_cost = 0

with open("cloud_usage.csv", "r") as file:
    reader = csv.DictReader(file)
    for row in reader:
        total_today_cost += float(row["cost"])

print(f"📊 Total cost today: ₹{total_today_cost}")
print(f"🔮 Predicted cost for tomorrow: ₹{total_today_cost}")
