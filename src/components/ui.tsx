import { spiceInfo } from "@/lib/spice";
import type { Platform, Spice } from "@/lib/types";

export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="mb-3 text-sm font-semibold text-gray-500">{title}</h2>}
      {children}
    </section>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gray-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </Card>
  );
}

export function SpiceBadge({ s }: { s: Spice }) {
  const { name, chip } = spiceInfo(s);
  return <span className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${chip}`}>🌶 {s} · {name}</span>;
}

export function PlatformBadge({ p }: { p: Platform }) {
  return (
    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      {p === "leetcode" ? "LeetCode" : "프로그래머스"}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">{children}</span>;
}
