import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://ai-cloud-cost-optimizer.onrender.com";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatCompactCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  })}`;

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-6 6" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" /></>,
    arrow: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
    down: <><path d="M7 10l5 5 5-5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    cloud: <><path d="M20 16.2A4.5 4.5 0 0 0 18 7.5a6 6 0 0 0-11.6 1.8A4 4 0 0 0 7 17h12" /><path d="m12 11-2 2 2 2m0-4 2 2-2 2" /></>,
    alert: <><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function App() {
  const [dashboard, setDashboard] = useState({
    summary: null,
    usage: [],
    waste: [],
    anomalies: [],
    recommendations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 30000);
    const endpoints = [
      ["summary", "/cost-summary"],
      ["usage", "/usage"],
      ["waste", "/waste"],
      ["anomalies", "/anomalies"],
      ["recommendations", "/recommendations"],
    ];

    Promise.all(
      endpoints.map(async ([key, path]) => {
        const response = await fetch(`${API_BASE}${path}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`${path} returned ${response.status}`);
        }
        return [key, await response.json()];
      }),
    )
      .then((entries) => {
        setDashboard((current) => ({ ...current, ...Object.fromEntries(entries) }));
        setLastUpdated(new Date());
      })
      .catch((fetchError) => {
        if (!disposed && timedOut) {
          setError("The cost intelligence API took too long to respond. Check the backend and try again.");
        } else if (!disposed && fetchError.name !== "AbortError") {
          setError("We couldn’t reach the cost intelligence API. Check the backend and try again.");
        }
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!disposed) setLoading(false);
      });

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [retryCount]);

  const chartData = useMemo(() => {
    const hourly = new Map();
    dashboard.usage.forEach((row) => {
      const time = row.timestamp?.slice(11, 16) || "";
      hourly.set(time, (hourly.get(time) || 0) + Number(row.cost || 0));
    });
    return [...hourly.entries()].map(([time, cost]) => ({ time, cost }));
  }, [dashboard.usage]);

  const totalCost = Number(dashboard.summary?.total_cost_today || 0);
  const wastedCost = Number(dashboard.summary?.money_wasted || 0);
  const tomorrowCost = Number(dashboard.summary?.predicted_cost_tomorrow || 0);
  const savingsRate = totalCost ? Math.round((wastedCost / totalCost) * 100) : 0;
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Nimbly home">
          <span className="brand-mark"><Icon name="cloud" size={23} /></span>
          <span className="brand-name">nimbly<span>.</span></span>
        </a>

        <div className="workspace-picker">
          <span className="workspace-avatar">A</span>
          <span className="workspace-copy"><strong>Acme workspace</strong><small>Cloud team</small></span>
          <Icon name="down" size={16} />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#overview"><Icon name="grid" /><span>Overview</span></a>
          <a className="nav-link" href="#spend"><Icon name="chart" /><span>Cost explorer</span></a>
          <a className="nav-link" href="#resources"><Icon name="layers" /><span>Resources</span><span className="nav-count">{dashboard.waste.length || "—"}</span></a>
          <a className="nav-link" href="#insights"><Icon name="spark" /><span>Recommendations</span></a>
          <a className="nav-link" href="#alerts"><Icon name="shield" /><span>Anomaly alerts</span>{dashboard.anomalies.length > 0 && <span className="nav-dot" />}</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-icon"><Icon name="spark" size={17} /></span>
            <strong>Spend smarter</strong>
            <p>Turn cloud spend into your next advantage.</p>
            <a href="#insights">Explore insights <span>↗</span></a>
          </div>
          <a className="nav-link settings-link" href="#settings"><Icon name="settings" /><span>Settings</span></a>
          <div className="profile">
            <span className="profile-avatar">SK</span>
            <span className="workspace-copy"><strong>Sriman K</strong><small>Owner</small></span>
            <Icon name="down" size={16} />
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="live-status"><span /> Live data</span>
            <button className="icon-button" aria-label="View alerts"><Icon name="alert" size={18} />{dashboard.anomalies.length > 0 && <i />}</button>
            <button className="date-button"><Icon name="clock" size={16} /> Last 24 hours <Icon name="down" size={15} /></button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">{dateLabel}</p>
              <h1>Your cloud, <span>in good shape.</span></h1>
              <p className="welcome-subtitle">A clearer view of where your cloud budget goes—and what to do next.</p>
            </div>
            <div className="sync-label"><span className="sync-pulse" />{lastUpdated ? `Synced ${lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Connecting to your workspace"}</div>
          </section>

          {error && (
            <div className="error-banner" role="alert">
              <Icon name="alert" size={18} />
              <span>{error}</span>
              <button onClick={() => {
                setLoading(true);
                setError("");
                setRetryCount((count) => count + 1);
              }}>Try again</button>
            </div>
          )}

          {loading ? (
            <div className="loading-panel"><span className="loader" /> Gathering your cloud insights…</div>
          ) : (
            <>
              <section className="metric-grid" aria-label="Cost summary">
                <article className="metric-card metric-primary">
                  <div className="metric-top"><span className="metric-label">Total cloud spend</span><span className="metric-icon"><Icon name="chart" size={19} /></span></div>
                  <p className="metric-value">{formatCurrency(totalCost)}</p>
                  <div className="metric-foot"><span className="metric-note">Across all tracked resources</span><span className="metric-period">TODAY</span></div>
                  <div className="metric-sparkline" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-label">Potential waste</span><span className="metric-icon icon-coral"><Icon name="layers" size={19} /></span></div>
                  <p className="metric-value">{formatCurrency(wastedCost)}</p>
                  <div className="metric-foot"><span className="metric-note">{savingsRate}% of today’s spend</span><span className="metric-trend trend-down"><Icon name="arrow" size={14} /> Optimize</span></div>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-label">Forecast for tomorrow</span><span className="metric-icon icon-lilac"><Icon name="spark" size={19} /></span></div>
                  <p className="metric-value">{formatCurrency(tomorrowCost)}</p>
                  <div className="metric-foot"><span className="metric-note">AI-powered cost prediction</span><span className="metric-trend trend-neutral"><Icon name="spark" size={13} /> Forecast</span></div>
                </article>
                <article className="metric-card">
                  <div className="metric-top"><span className="metric-label">Active cost alerts</span><span className="metric-icon icon-amber"><Icon name="shield" size={19} /></span></div>
                  <p className="metric-value">{dashboard.anomalies.length.toString().padStart(2, "0")}<span className="metric-unit"> alerts</span></p>
                  <div className="metric-foot"><span className="metric-note">Unusual spend patterns</span><span className={`metric-trend ${dashboard.anomalies.length ? "trend-alert" : "trend-down"}`}>{dashboard.anomalies.length ? "Needs review" : "All clear"}</span></div>
                </article>
              </section>

              <section className="content-grid" id="spend">
                <article className="panel spend-panel">
                  <SectionTitle
                    eyebrow="SPEND OVER TIME"
                    title="Your cost pulse"
                    action={<span className="chart-legend"><i /> Hourly spend</span>}
                  />
                  <div className="chart-summary"><strong>{formatCurrency(totalCost)}</strong><span>total recorded today</span></div>
                  {chartData.length ? (
                    <div className="chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 16, right: 4, left: -14, bottom: 0 }}>
                          <defs><linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#77e2b0" stopOpacity={0.28} /><stop offset="94%" stopColor="#77e2b0" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid vertical={false} stroke="#edf0ee" strokeDasharray="3 5" />
                          <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#98a19e", fontSize: 11 }} minTickGap={30} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#98a19e", fontSize: 11 }} tickFormatter={formatCompactCurrency} />
                          <Tooltip
                            contentStyle={{ border: "1px solid #e8eeea", borderRadius: 12, boxShadow: "0 8px 24px #172a2014", fontSize: 12 }}
                            formatter={(value) => [formatCurrency(value), "Spend"]}
                            labelStyle={{ color: "#73807a", marginBottom: 4 }}
                          />
                          <Area type="monotone" dataKey="cost" stroke="#1b9b70" strokeWidth={2.5} fill="url(#spendFill)" activeDot={{ r: 5, fill: "#1b9b70", stroke: "#fff", strokeWidth: 3 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <div className="empty-chart">Cost history will appear here when usage data is available.</div>}
                  <div className="chart-footer"><span><i className="legend-dot green-dot" />Current spend</span><span><i className="legend-dot pale-dot" />Hourly usage window</span></div>
                </article>

                <article className="panel insight-panel" id="insights">
                  <SectionTitle eyebrow="THE OPPORTUNITY" title="Savings at a glance" />
                  <div className="savings-ring" style={{ "--savings-progress": `${Math.min(savingsRate, 100)}%` }}>
                    <div><strong>{savingsRate}%</strong><span>of spend<br />is recoverable</span></div>
                  </div>
                  <p className="savings-copy">Your usage data points to <strong>{formatCurrency(wastedCost)}</strong> in potential daily savings.</p>
                  <div className="insight-divider" />
                  <div className="insight-stat"><span className="insight-stat-icon"><Icon name="layers" size={16} /></span><span>Resources to review</span><strong>{dashboard.waste.length}</strong></div>
                  <a className="text-link" href="#resources">See optimization opportunities <Icon name="arrow" size={15} /></a>
                </article>
              </section>

              <section className="panel resource-panel" id="resources">
                <SectionTitle
                  eyebrow="RESOURCE EFFICIENCY"
                  title="Worth a closer look"
                  action={<a className="text-link panel-link" href="#insights">View recommendations <Icon name="arrow" size={15} /></a>}
                />
                {dashboard.waste.length ? (
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>RESOURCE</th><th>STATUS</th><th>IDLE HOURS</th><th>EST. DAILY WASTE</th><th /></tr></thead>
                      <tbody>{dashboard.waste.map((item) => (
                        <tr key={item.resource_id}>
                          <td><span className="resource-cell-icon"><Icon name="cloud" size={16} /></span><span className="resource-name">{item.resource_id}<small>Virtual machine</small></span></td>
                          <td><span className="status-pill"><i />Underutilized</span></td>
                          <td>{item.idle_hours} hrs</td>
                          <td className="waste-value">{formatCurrency(item.money_wasted)}</td>
                          <td><a className="row-action" href="#insights" aria-label={`View recommendation for ${item.resource_id}`}><Icon name="arrow" size={16} /></a></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : <div className="empty-state"><span className="empty-icon"><Icon name="check" size={20} /></span><strong>Looking good so far</strong><p>No underutilized resources were found.</p></div>}
              </section>

              <section className="bottom-grid">
                <article className="panel recommendation-panel">
                  <SectionTitle eyebrow="SMART RECOMMENDATIONS" title="Your next best moves" action={<span className="powered-label"><Icon name="spark" size={14} /> AI powered</span>} />
                  {dashboard.recommendations.length ? (
                    <div className="recommendation-list">{dashboard.recommendations.map((item) => (
                      <div className="recommendation-item" key={item.resource_id}>
                        <span className="recommendation-icon"><Icon name="spark" size={17} /></span>
                        <div className="recommendation-copy"><strong>{item.recommendation} <span>{item.resource_id}</span></strong><p>{item.reason}</p></div>
                        <div className="recommendation-saving"><strong>{formatCurrency(item.estimated_monthly_savings)}</strong><span>est. monthly savings</span></div>
                      </div>
                    ))}</div>
                  ) : <div className="empty-state compact-empty"><strong>No recommendations just yet</strong><p>We’ll surface practical ways to save as usage data comes in.</p></div>}
                </article>

                <article className="panel alerts-panel" id="alerts">
                  <SectionTitle eyebrow="ANOMALY WATCH" title="Spend alerts" action={<span className="alert-count">{dashboard.anomalies.length} active</span>} />
                  {dashboard.anomalies.length ? (
                    <div className="alert-list">{dashboard.anomalies.slice(0, 3).map((item, index) => (
                      <div className="alert-item" key={`${item.resource}-${item.time}-${index}`}>
                        <span className="alert-icon"><Icon name="alert" size={16} /></span>
                        <div><strong>{item.resource}</strong><p>{item.reason}</p><small>{item.time}</small></div>
                        <span className="alert-cost">{formatCurrency(item.cost)}</span>
                      </div>
                    ))}</div>
                  ) : <div className="all-clear"><span><Icon name="check" size={17} /></span><div><strong>All quiet here</strong><p>No unusual spend detected.</p></div></div>}
                </article>
              </section>

              <footer className="page-footer"><span>Made for clearer cloud decisions.</span><span>Data refreshes when you reload this page.</span></footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
