def generate_recommendation(resource):
    idle_hours = resource["idle_hours"]
    cost = resource["money_wasted"]

    if idle_hours >= 24:
        return {
            "recommendation": "Terminate instance",
            "reason": "Idle for more than 24 hours",
            "estimated_monthly_savings": cost * 30
        }

    if idle_hours >= 8:
        return {
            "recommendation": "Downsize instance",
            "reason": "Underutilized for long duration",
            "estimated_monthly_savings": cost * 15
        }

    return {
        "recommendation": "Monitor",
        "reason": "Usage within acceptable range",
        "estimated_monthly_savings": 0
    }
