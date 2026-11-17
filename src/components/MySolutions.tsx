"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AttemptDetail from "@/components/AttemptDetail";
import { Card, PlatformBadge, SpiceBadge, Tag } from "@/components/ui";
import { useRecords } from "@/lib/records";
import { problemHref } from "@/lib/slug";
import { fmtTime, LANGS } from "@/lib/solution";
import type { Problem } from "@/lib/types";

type Tab = "solved" | "failed";

export default function MySolutions({ catalog }: { catalog: Problem[] }) {
  const records = useRecords();
  const [tab, setTab] = useState<Tab>("solved");

  const items = useMemo(() => {
    const byId = new Map(catalog.map((p) => [p.id, p]));
    const ids = new Set<string>([...catalog.filter((p) => p.status !== "unsolved").map((p) => p.id), ...Object.keys(records)]);
    return [...ids]
      .map((id) => {
        const problem = byId.get(id);
        const record = records[id];
        if (!problem) return null;
        const status = record?.status ?? problem.status;
        const date = record?.at.slice(0, 10) ?? problem.lastDate;
        return { problem, record, status, date, sort: record?.at ?? problem.lastDate };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.sort.localeCompare(a.sort));
  }, [catalog, records]);

  const count = (t: Tab) => items.filter((i) => i.status === t).length;
  const rows = items.filter((i) => i.status === tab);

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {(["solved", "failed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1 text-sm ${tab === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {t === "solved" ? "푼 문제" : "못 푼 문제"} {count(t)}
          </button>
        ))}
      </div>

      <Card className="!p-0">
        <ul className="divide-y divide-gray-100">
          {rows.map(({ problem: p, record: r, date }) => (
            <li key={p.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-5 py-3 hover:bg-gray-50">
                  <span className="text-gray-400 transition group-open:rotate-90">▸</span>
                  <PlatformBadge p={p.platform} />
                  <SpiceBadge s={p.spice} />
                  <span className="font-medium">{p.title}</span>
                  <span className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                    {r && <span>{LANGS.find((l) => l.v === r.lang)?.label} · {fmtTime(r.seconds)}</span>}
                    {!r?.memo && !r?.code && <span className="rounded bg-gray-100 px-1.5 py-0.5">기록 없음</span>}
                    <span>{date}</span>
                  </span>
                </summary>

                <div className="space-y-5 border-t border-gray-50 bg-gray-50/50 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noreferrer" className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                        문제 링크 열기 ↗
                      </a>
                    )}
                    <Link href={problemHref(p.id)} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">
                      다시 풀기
                    </Link>
                    <span className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </span>
                  </div>

                  <AttemptDetail record={r} />
                </div>
              </details>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-gray-400">
              {tab === "solved" ? "아직 푼 문제가 없어요." : "못 푼 문제가 없어요. 풀이 중 '못 풀겠어요'를 누르면 여기에 쌓입니다."}
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
