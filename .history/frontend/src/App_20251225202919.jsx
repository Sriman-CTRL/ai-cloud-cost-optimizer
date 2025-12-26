import { useEffect, useState } from "react";
import "./index.css";






import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



function App() {
  const [summary, setSummary] = useState(null);
  const [waste, setWaste] = useState([]);
  const [usage, setUsage] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/cost-summary")
      .then((res) => res.json())
      .then((data) => setSummary(data));

    fetch("http://127.0.0.1:8000/waste")
      .then((res) => res.json())
      .then((data) => setWaste(data));

    fetch("http://127.0.0.1:8000/usage")
      .then((res) => res.json())
      .then((data) => setUsage(data));
  }, []);

  if (!summary) {
    return <div className="p-10">Loading...</div>;
  }

  // Prepare chart data: cost per hour
  const chartData = usage.map((row) => ({
    time: row.timestamp.slice(11, 16),
    cost: Number(row.cost),
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        AI Cloud Cost Optimizer Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

      {/* Cost Trend Chart */}
      <div className="bg-gray-800 p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Cost Trend (Hourly)
        </h2>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#22c55e"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>



<h2 className="text-xl font-semibold mt-8 mb-4 text-red-600">
  ⚠️ Cost Anomaly Alerts
</h2>

{anomalies.length === 0 ? (
  <p className="text-gray-500">No anomalies detected 🎉</p>
) : (
  <div className="space-y-4">
    {anomalies.map((item, index) => (
      <div
        key={index}
        className="bg-red-100 border border-red-400 text-red-800 p-4 rounded-lg shadow"
      >
        <p><strong>Resource:</strong> {item.resource_id}</p>
        <p><strong>Time:</strong> {item.timestamp}</p>
        <p><strong>Cost:</strong> ₹{item.cost}</p>
      </div>
    ))}
  </div>
)}



      {/* Waste Table */}
      <div className="bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Wasted Resources
        </h2>

        {waste.length === 0 ? (
          <p className="text-gray-400">No waste detected 🎉</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2">Resource</th>
                <th className="py-2">Idle Hours</th>
                <th className="py-2">Money Wasted</th>
              </tr>
            </thead>
            <tbody>
              {waste.map((item) => (
                <tr
                  key={item.resource_id}
                  className="border-b border-gray-700"
                >
                  <td className="py-2">{item.resource_id}</td>
                  <td className="py-2">{item.idle_hours}</td>
                  <td className="py-2 text-red-400">
                    ₹{item.money_wasted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
