"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const COLORS = { accent: "var(--color-indigo-500)" };

export function MonthlyBar({ data }: { data: { month: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-gray-200)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-gray-500)" }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-gray-500)" }} width={28} />
        <Tooltip />
        <Bar dataKey="count" name="풀이 수" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DifficultyPie({ data }: { data: { name: string; value: number; fill: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} label>
          {data.map((d) => (
            <Cell key={d.name} fill={d.fill} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TopicRadar({ data }: { data: { tag: string; solved: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="tag" tick={{ fontSize: 11, fill: "var(--color-gray-500)" }} />
        <PolarRadiusAxis tick={{ fontSize: 10, fill: "var(--color-gray-500)" }} />
        <Radar dataKey="solved" name="풀이 수" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.35} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
