"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PLATFORMS, setTheme, THEMES, usePlatforms, useTheme } from "@/lib/prefs";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const platforms = usePlatforms();

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const item = "block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="내 메뉴"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <div className="px-3 py-2">
            <div className="text-sm font-semibold">hyeonwoo</div>
            <div className="text-xs text-gray-400">{platforms.map((p) => PLATFORMS.find((x) => x.id === p)?.label).join(" · ")}</div>
          </div>
          <div className="my-1 border-t border-gray-100" />
          <Link href="/me" role="menuitem" onClick={() => setOpen(false)} className={item}>
            마이페이지
          </Link>
          <Link href="/settings" role="menuitem" onClick={() => setOpen(false)} className={item}>
            설정
          </Link>
          <div className="my-1 border-t border-gray-100" />
          <div className="px-3 pb-1 pt-2 text-xs text-gray-400">테마</div>
          <div className="flex gap-2 px-3 pb-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                aria-label={`${t.label} 테마`}
                aria-pressed={theme === t.id}
                className={`flex h-9 w-9 flex-col overflow-hidden rounded-lg border ${theme === t.id ? "ring-2 ring-indigo-500" : "border-gray-300"}`}
              >
                <span className="flex-1" style={{ background: t.colors[0] }} />
                <span className="h-3" style={{ background: t.colors[2] }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
