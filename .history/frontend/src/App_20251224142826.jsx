import { useEffect, useState } from "react";

function App() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/cost-summary")
      .then((res) => res.json())
      .then((data) => setSummary(data));
  }, []);

  if (!summary) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>AI Cloud Cost Optimizer Dashboard</h1>
      <p>Total Cost Today: ₹{summary.total_cost_today}</p>
      <p>Money Wasted: ₹{summary.money_wasted}</p>
      <p>Predicted Cost Tomorrow: ₹{summary.predicted_cost_tomorrow}</p>
    </div>
  );
}

export default App;
