"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/settings", label: "일반" },
  { href: "/settings/editor", label: "에디터" },
];

export default function SettingsTabs() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 border-b border-gray-200">
      {tabs.map((t) => {
        const on = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${on ? "border-indigo-600 font-semibold text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
