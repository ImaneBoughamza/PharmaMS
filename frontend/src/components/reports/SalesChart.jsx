import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonth(item) {
  const month = MONTH_NAMES[(item._id?.month ?? 1) - 1] ?? "";
  const year  = item._id?.year ?? "";
  return `${month} ${year}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(value);
}

export default function SalesChart({ data }) {
  const chartData = (data ?? []).map((item) => ({
    name: formatMonth(item),
    revenue: item.totalRevenue ?? 0,
    sales: item.saleCount ?? 0,
  }));

  if (chartData.length === 0) {
    return (
      <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.9rem", color: "var(--color-text-muted)", textAlign: "center", padding: "2rem" }}>
        No sales data available.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="name"
          tick={{ fontFamily: "var(--font-ui)", fontSize: 12, fill: "var(--color-text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          tick={{ fontFamily: "var(--font-ui)", fontSize: 11, fill: "var(--color-text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(value), "Revenue"]}
          contentStyle={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.82rem",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
          }}
        />
        <Bar dataKey="revenue" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
