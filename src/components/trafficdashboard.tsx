import React, { useEffect, useState } from "react";
import { getNetworkStats } from "../utils/trafficTracker";

const TrafficDashboard = () => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalBytes: 0,
    typeCounts: {} as Record<string, number>,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getNetworkStats());
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Live Network Traffic (This Site)</h2>
      <p>Total Requests: {stats.totalRequests}</p>
      <p>Total Data Loaded: {Math.round(stats.totalBytes / 1024)} KB</p>

      <h3>Requests by Type:</h3>
      <ul>
        {Object.entries(stats.typeCounts).map(([type, count]) => (
          <li key={type}>
            {type}: {count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrafficDashboard;