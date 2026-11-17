"use client";

import { Card } from "@/components/ui";
import { PLATFORMS, setPlatforms, setTheme, THEMES, usePlatforms, useTheme } from "@/lib/prefs";

export default function SettingsClient() {
  const theme = useTheme();
  const platforms = usePlatforms();

  return (
    <div className="space-y-6">
      <Card title="테마">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-pressed={theme === t.id}
              className={`rounded-xl border p-3 text-left transition ${theme === t.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200 hover:border-gray-300"}`}
            >
              {/* 미리보기: 배경 + 카드 + 포인트 색 */}
              <div className="flex h-20 flex-col justify-between rounded-lg p-2" style={{ background: t.colors[0] }}>
                <div className="h-2 w-10 rounded" style={{ background: t.colors[2] }} />
                <div className="flex gap-1.5">
                  <div className="h-8 flex-1 rounded-md border" style={{ background: t.colors[1], borderColor: "rgba(128,128,128,.25)" }} />
                  <div className="h-8 w-8 rounded-md" style={{ background: t.colors[2] }} />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold">{t.label}</span>
                {theme === t.id && <span className="text-xs font-medium text-indigo-600">사용 중</span>}
              </div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card title="사용 플랫폼">
        <p className="mb-3 text-sm text-gray-500">문제 추천은 선택한 플랫폼의 문제에서만 골라요. 하나 이상 선택해야 합니다.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLATFORMS.map((p) => {
            const on = platforms.includes(p.id);
            const last = on && platforms.length === 1;
            return (
              <button
                key={p.id}
                onClick={() => setPlatforms(on ? platforms.filter((x) => x !== p.id) : [...platforms, p.id])}
                disabled={last}
                aria-pressed={on}
                title={last ? "최소 한 개는 선택해야 해요" : undefined}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${on ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200 hover:border-gray-300"} ${last ? "cursor-not-allowed" : ""}`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${on ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300"}`}>{on ? "✓" : ""}</span>
                <span>
                  <span className="block font-semibold">{p.label}</span>
                  <span className="block text-xs text-gray-500">{p.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <p className="text-xs text-gray-400">설정은 지금 이 브라우저에만 저장됩니다. 계정 연동 후에는 기기 간에 공유됩니다.</p>
    </div>
  );
}
