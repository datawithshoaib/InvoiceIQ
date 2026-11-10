"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, humanize, isMoneyColumn } from "@/lib/format";
import type { QueryResponse } from "@/lib/types";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--popover-foreground)",
  fontSize: 12,
};

function pickColumns(result: QueryResponse) {
  const first = result.rows[0] ?? {};
  const numeric = result.columns.filter((c) => typeof first[c] === "number");
  const label = result.columns.find((c) => !numeric.includes(c));
  const value = numeric.find(isMoneyColumn) ?? numeric[0];
  return { label, value, numeric };
}

export function QueryChart({ result }: { result: QueryResponse }) {
  if (result.chartType === "metric" && result.metricValue !== null) {
    return (
      <Card className="bg-gradient-to-br from-primary/15 to-card">
        <CardHeader>
          <CardDescription>{result.metricLabel ?? "Result"}</CardDescription>
          <CardTitle className="text-4xl tracking-tight tabular-nums">
            {formatCurrency(result.metricValue)}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const { label, value, numeric } = pickColumns(result);
  if (
    !label ||
    !value ||
    result.rows.length < 2 ||
    result.chartType === "table"
  )
    return null;

  const data = result.rows.map((row) => ({
    ...row,
    [label]: String(row[label] ?? "—"),
  }));
  const fmt = (v: unknown) =>
    isMoneyColumn(value) ? formatCurrency(Number(v)) : String(v);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {humanize(value)} by {humanize(label)}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {result.chartType === "pie" ? (
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} formatter={fmt} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Pie
                data={data}
                dataKey={value}
                nameKey={label}
                innerRadius="55%"
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    stroke="var(--card)"
                  />
                ))}
              </Pie>
            </PieChart>
          ) : result.chartType === "line" ? (
            <LineChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey={label}
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={70}
                tickFormatter={fmt}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={fmt} />
              {numeric.map((col, i) => (
                <Line
                  key={col}
                  dataKey={col}
                  name={humanize(col)}
                  type="monotone"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={fmt}
              />
              <YAxis
                type="category"
                dataKey={label}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={150}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={fmt}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar
                dataKey={value}
                name={humanize(value)}
                radius={4}
                fill="var(--chart-1)"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
