"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";

const items = [
  { href: "/recommend", label: "문제 추천" },
  { href: "/problems", label: "전체 문제" },
  { href: "/ranking", label: "랭킹" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="relative z-40 border-b border-gray-200 bg-white">
      <div className="flex w-full items-center gap-6 px-4 py-3 md:px-8">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          algo-route
        </Link>
        <nav className="flex gap-1">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`rounded-md px-3 py-1.5 text-sm ${
                path === i.href ? "bg-indigo-50 font-semibold text-indigo-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">MOCKUP</span>
        <UserMenu />
      </div>
    </header>
  );
}
