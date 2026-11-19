"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlatformBadge, Tag } from "@/components/ui";
import { FADE_SOLVES } from "@/lib/initial-spice";
import { useOnboarding, usePrior } from "@/lib/onboarding";
import { usePlatforms } from "@/lib/prefs";
import { useRecords } from "@/lib/records";
import { effective, MODES, recommendBy, type RecMode } from "@/lib/recommend";
import { problemHref } from "@/lib/slug";
import { EXPECTED_MIN } from "@/lib/solution";
import { spiceInfo } from "@/lib/spice";
import type { Problem } from "@/lib/types";

export interface HeroStats {
  streak: number;
  weekly: number;
  avg: number | null;
  ramen: string | null;
}

const BAR: Record<RecMode, string> = {
  review: "bg-sky-400",
  weak: "bg-rose-400",
  new: "bg-emerald-400",
  retry: "bg-violet-400",
  adapt: "bg-orange-400",
  spaced: "bg-teal-400",
};

function Chilis({ level }: { level: number }) {
  return (
    <span aria-label={`맵기 ${level}단계`} className="text-sm tracking-tighter">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= level ? "" : "opacity-20 grayscale"}>
          🌶
        </span>
      ))}
    </span>
  );
}

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">{children}</span>
);

export default function RecommendClient({ catalog, stats }: { catalog: Problem[]; stats: HeroStats }) {
  const records = useRecords();
  const platforms = usePlatforms();
  const onboarding = useOnboarding();
  const { prior, weight } = usePrior();
  const [mode, setMode] = useState<RecMode | null>(null);
  const [passed, setPassed] = useState<Record<string, true>>({});

  const list = useMemo(() => effective(catalog, records), [catalog, records]);
  // 방식별 추천 후보 (카드의 개수 표시와 선택 시 결과에 같이 씀)
  const byMode = useMemo(
    () => Object.fromEntries(MODES.map((m) => [m.v, recommendBy(m.v, list, records, platforms, prior)])) as Record<RecMode, ReturnType<typeof recommendBy>>,
    [list, records, platforms, prior],
  );

  const all = mode ? byMode[mode] : [];
  const shown = all.filter((r) => !passed[`${mode}:${r.problem.id}`]).slice(0, 3);
  const cur = MODES.find((m) => m.v === mode);

  const surprise = () => {
    const open = MODES.filter((m) => byMode[m.v].length > 0);
    if (open.length) setMode(open[Math.floor(Math.random() * open.length)].v);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <div className="text-lg font-bold">오늘은 어떻게 풀어볼까요?</div>
            <div className="text-sm text-gray-500">풀고 싶은 방식을 고르거나, 고민되면 맡겨보세요.</div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Pill>🔥 연속 {stats.streak}일</Pill>
            <Pill>📅 이번 주 {stats.weekly}문제</Pill>
            {stats.avg !== null && (
              <Pill>
                🌶 평균 {stats.avg.toFixed(1)} · {stats.ramen}
              </Pill>
            )}
            <button onClick={surprise} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              🎲 아무거나 추천해줘
            </button>
          </div>
        </div>
      </section>

      {onboarding ? (
        weight > 0 && (
          <p className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 text-sm text-orange-800">
            🌶 시작 맵기 <b>{onboarding.spice.toFixed(1)}</b>를 추천에 반영 중이에요 · 영향력 {Math.round(weight * 100)}% (직접 {FADE_SOLVES}문제를 풀면 사라져요)
          </p>
        )
      ) : (
        <p className="flex flex-wrap items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm text-indigo-800">
          내 맵기를 아직 정하지 않았어요.
          <Link href="/onboarding" className="font-semibold underline">
            문제 몇 개로 시작 맵기 정하기 →
          </Link>
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {MODES.map((m) => {
          const n = byMode[m.v].length;
          const on = mode === m.v;
          return (
            <button
              key={m.v}
              onClick={() => setMode(m.v)}
              aria-pressed={on}
              className={`relative overflow-hidden rounded-xl border p-4 pt-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                on ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-gray-200 bg-white hover:border-gray-300"
              } ${n === 0 ? "opacity-70" : ""}`}
            >
              <span className={`absolute inset-x-0 top-0 h-1 ${BAR[m.v]}`} />
              <div className="flex items-start justify-between">
                <span className="text-2xl">{m.icon}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${n ? m.chip : "bg-gray-100 text-gray-400"}`}>{n ? `후보 ${n}` : "없음"}</span>
              </div>
              <div className="mt-2 font-semibold">{m.label}</div>
              <div className="text-xs text-gray-500">{m.short}</div>
            </button>
          );
        })}
      </div>

      {!cur ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-14 text-center">
          <div className="text-3xl">👆</div>
          <p className="mt-2 text-sm text-gray-400">위에서 방식을 하나 골라보세요. 고르면 그 방식에 맞는 문제를 추천해드려요.</p>
        </div>
      ) : (
        <div key={mode} className="rise space-y-4">
          <p className="text-sm text-gray-500">
            <b className="text-gray-700">
              {cur.icon} {cur.label}
            </b>{" "}
            · {cur.how}
          </p>

          {shown.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-400 shadow-sm">
              {all.length ? "이 방식의 추천을 모두 넘겼어요. 다른 방식을 골라보세요." : cur.empty}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {shown.map(({ problem: p, reason }, i) => (
                <article
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`h-1.5 ${BAR[cur.v]}`} />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cur.chip}`}>
                        {cur.icon} {cur.label}
                      </span>
                      <PlatformBadge p={p.platform} />
                      <span className="ml-auto text-xs text-gray-400">추천 {i + 1}</span>
                    </div>

                    <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <Chilis level={p.spice} />
                      <span>{spiceInfo(p.spice).name}</span>
                      <span className="text-gray-300">·</span>
                      <span>⏱ 권장 {EXPECTED_MIN[p.spice]}분</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>

                    <div className="mt-4 flex-1 rounded-lg bg-gray-50 p-3">
                      <div className="text-[11px] font-semibold text-gray-400">왜 이 문제?</div>
                      <p className="mt-0.5 text-sm text-gray-700">{reason}</p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link href={problemHref(p.id)} className="flex-1 rounded-md bg-indigo-600 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700">
                        풀어보기 →
                      </Link>
                      <button
                        onClick={() => setPassed((cur) => ({ ...cur, [`${mode}:${p.id}`]: true }))}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        패스
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
