import {
  BarChart,
  Bar,
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
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontFamily: "Inter, sans-serif", fontSize: 11, fill: "#8C8C8C" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontFamily: "Inter, sans-serif", fontSize: 11, fill: "#8C8C8C" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v} MAD`}
            width={70}
          />
          <Tooltip
            contentStyle={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              borderRadius: 4,
              border: "1px solid var(--color-border)",
              background: "#fff",
            }}
            formatter={(value) => [`${value} MAD`, "Sales"]}
          />
          <Bar dataKey="total" fill="#1F7A5A" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
