"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "개요" },
  { href: "/admin/difficulty", label: "난이도 관리" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <header className="border-b border-slate-800 bg-slate-900 text-slate-100">
      <div className="flex w-full items-center gap-6 px-4 py-3 md:px-8">
        <Link href="/admin" className="text-lg font-bold">
          algo-route <span className="ml-1 rounded bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">ADMIN</span>
        </Link>
        <nav className="flex gap-1">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`rounded-md px-3 py-1.5 text-sm ${path === i.href ? "bg-slate-700 font-semibold text-white" : "text-slate-300 hover:bg-slate-800"}`}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="ml-auto text-xs text-slate-400 hover:text-white">
          서비스로 돌아가기 →
        </Link>
      </div>
    </header>
  );
}
