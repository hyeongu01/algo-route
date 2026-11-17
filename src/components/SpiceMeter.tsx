import { SPICE_LEVELS, spiceInfo } from "@/lib/spice";
import type { Spice } from "@/lib/types";

const near = (v: number) => Math.min(5, Math.max(1, Math.round(v))) as Spice;
const pos = (v: number) => `${((Math.min(5, Math.max(1, v)) - 1) / 4) * 100}%`;

/** 내 맵기를 수치 + 가장 가까운 라면으로 보여주는 게이지 (1~5 눈금) */
export default function SpiceMeter({ avg, recent, recentN }: { avg: number; recent: number; recentN: number }) {
  const info = spiceInfo(near(avg));
  const diff = recent - avg;
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums">{avg.toFixed(1)}</span>
        <span className="text-lg font-semibold">{info.ramen}</span>
        <span className="text-xs text-gray-400">내 평균 맵기</span>
      </div>
      <div className="mt-0.5 text-xs text-gray-500">
        최근 {recentN}문제 <b className="tabular-nums text-gray-700">{recent.toFixed(1)}</b> · {spiceInfo(near(recent)).ramen}
        {Math.abs(diff) >= 0.05 && (
          <span className={diff > 0 ? "ml-1 text-red-500" : "ml-1 text-sky-500"}>
            {diff > 0 ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
          </span>
        )}
      </div>

      <div className="relative mt-3 pb-8">
        {/* 레벨 색이 눈금 위치(1~5)에 정확히 오도록 그라데이션 */}
        <div className="h-2 rounded-full" style={{ background: `linear-gradient(to right, ${SPICE_LEVELS.map((l) => l.fill).join(", ")})` }} />
        <div className="absolute top-[-4px] h-4 w-0.5 -translate-x-1/2 rounded bg-gray-900" style={{ left: pos(avg) }} title={`내 평균 ${avg.toFixed(1)}`} />
        <div className="absolute top-3 -translate-x-1/2 text-[10px] leading-none text-gray-500" style={{ left: pos(recent) }} title={`최근 ${recent.toFixed(1)}`}>
          ▲
        </div>
        {SPICE_LEVELS.map((l) => (
          <div key={l.level} className="absolute top-[26px] -translate-x-1/2 text-center text-[10px] leading-tight text-gray-400" style={{ left: pos(l.level) }}>
            {l.level}
          </div>
        ))}
      </div>
    </div>
  );
}
