def explain_anomaly(anomaly, avg_cost):
    """
    anomaly: dict with keys -> resource_id, timestamp, cost
    avg_cost: average hourly cost for that resource
    """

    explanation = {}

    explanation["resource"] = anomaly["resource_id"]
    explanation["time"] = anomaly["timestamp"]
    explanation["cost"] = anomaly["cost"]

    # Rule-based explanation (interview-friendly)
    if anomaly["cost"] >= 3 * avg_cost:
        explanation["reason"] = "Cost is significantly higher than average"
        explanation["likely_cause"] = "Traffic spike or sudden workload increase"
        explanation["suggested_action"] = "Enable autoscaling limits and cost alerts"
    else:
        explanation["reason"] = "Minor cost fluctuation"
        explanation["likely_cause"] = "Normal workload variation"
        explanation["suggested_action"] = "Monitor usage"

    return explanation
