import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./SalesChart.module.css";

export default function SalesChart({ data = [] }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>Sales — Last 7 Days</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tick={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v} MAD`}
            width={70}
          />
          <Tooltip
            contentStyle={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              borderRadius: 8,
              border: "1px solid #E5E7EB",
            }}
            formatter={(value) => [`${value} MAD`, "Sales"]}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#2563EB" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
