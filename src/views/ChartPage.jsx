import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { useSensor } from "../components/SensorContext";

const ChartPage = () => {
  const [data, setData] = useState([]);
  const { gasValue, flameValue } = useSensor();

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();

      setData((prev) => [
        ...prev.slice(-9), // giữ tối đa 10 điểm
        {
          time: timestamp,
          gas: gasValue,
          flame: flameValue,
        },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [gasValue, flameValue]);

  return (
    <div
      style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        maxWidth: "900px",
        margin: "40px auto",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span role="img" aria-label="chart" style={{ marginRight: "8px" }}>
          📈
        </span>
        Biểu đồ cảm biến
      </h2>

      <Link to="/control">
        <button
          style={{
            marginBottom: "24px",
            padding: "10px 16px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Quay lại trang điều khiển
        </button>
      </Link>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="time" stroke="#333" />
          <YAxis stroke="#333" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              border: "none",
            }}
            labelStyle={{ fontWeight: "bold" }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="gas"
            stroke="#8884d8"
            name="Gas Value"
            dot={false}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="flame"
            stroke="#ff7300"
            name="Flame Value"
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartPage;
