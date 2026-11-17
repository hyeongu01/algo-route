"use client";

import AttemptDetail from "@/components/AttemptDetail";
import { useAttempts } from "@/lib/records";
import { fmtTime, LANGS } from "@/lib/solution";
import type { Problem } from "@/lib/types";

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** 왼쪽 사이드바용: 접힌 상태에서는 언어와 날짜만, 펼치면 메모/풀이/분석. */
export default function AttemptHistory({ problem }: { problem: Problem }) {
  const attempts = useAttempts(problem.id);

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-gray-500">
        내 풀이 내역{attempts.length ? ` (${attempts.length})` : ""}
      </h2>
      {attempts.length === 0 ? (
        <p className="text-xs leading-relaxed text-gray-400">
          {problem.status === "solved"
            ? `풀었지만(${problem.lastDate}) 이 앱에서 남긴 기록은 없어요. 다시 풀면 여기에 쌓입니다.`
            : "아직 기록이 없어요. 풀이를 시작하면 시도마다 여기에 쌓입니다."}
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {attempts.map((a) => (
            <li key={a.at}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-sm">
                  <span className="text-xs text-gray-400 transition group-open:rotate-90">▸</span>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${a.status === "solved" ? "bg-emerald-500" : "bg-rose-400"}`}
                    title={a.status === "solved" ? "풀었어요" : "못 풀었어요"}
                  />
                  <span className="font-medium text-gray-700">{LANGS.find((l) => l.v === a.lang)?.label}</span>
                  <span className="ml-auto text-xs text-gray-400">{fmtDate(a.at)}</span>
                </summary>
                <div className="pb-3 pt-1">
                  <div className="mb-3 text-xs text-gray-400">
                    {a.status === "solved" ? "풀었어요" : "못 풀었어요"} · {fmtTime(a.seconds)}
                  </div>
                  <AttemptDetail record={a} compact />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
