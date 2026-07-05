"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RevenuePoint {
  date: string;
  revenue: number;
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#576b48" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#576b48" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4d6bf" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => value.slice(5)}
            tick={{ fontSize: 12, fill: "#5c5c5c" }}
            interval={4}
          />
          <YAxis tick={{ fontSize: 12, fill: "#5c5c5c" }} width={50} />
          <Tooltip
            formatter={(value) => [`Rs ${Number(value).toLocaleString()}`, "Revenue"]}
            labelFormatter={(label) => label}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#576b48"
            fill="url(#revenueFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
