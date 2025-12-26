import { useEffect, useState } from "react";

function App() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/cost-summary")
      .then((res) => res.json())
      .then((data) => setSummary(data));
  }, []);

  if (!summary) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        AI Cloud Cost Optimizer Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-lg text-gray-400">Total Cost Today</h2>
          <p className="text-2xl font-bold mt-2">
            ₹{summary.total_cost_today}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-lg text-gray-400">Money Wasted</h2>
          <p className="text-2xl font-bold mt-2 text-red-400">
            ₹{summary.money_wasted}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-lg text-gray-400">
            Predicted Cost Tomorrow
          </h2>
          <p className="text-2xl font-bold mt-2 text-green-400">
            ₹{summary.predicted_cost_tomorrow}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
