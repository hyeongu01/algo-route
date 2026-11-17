import { ALL_TAGS, TODAY } from "./analysis";
import type { SolveRecord } from "./records";
import type { Platform, Problem, Recommendation, Spice } from "./types";

export type RecMode = "review" | "weak" | "new" | "retry" | "adapt" | "spaced";

export const MODES: { v: RecMode; label: string; icon: string; short: string; how: string; empty: string; chip: string }[] = [
  {
    v: "review",
    label: "복습",
    icon: "🔁",
    short: "오래 안 푼 주제를 다시",
    how: "푼 적 있는 주제 중 마지막 풀이가 가장 오래된 주제부터, 그 주제에서 평소 풀던 맵기와 비슷한 안 푼 문제를 고릅니다.",
    empty: "복습할 주제가 없어요. 문제를 몇 개 더 풀면 추천할 수 있어요.",
    chip: "bg-sky-100 text-sky-700",
  },
  {
    v: "weak",
    label: "약점 보강",
    icon: "🩹",
    short: "풀이 수가 적은 주제",
    how: "푼 적은 있지만 풀이 수가 적은 주제 순으로, 그 주제의 안 푼 문제를 고릅니다.",
    empty: "보강할 주제가 없어요.",
    chip: "bg-rose-100 text-rose-700",
  },
  {
    v: "new",
    label: "새로운 개념",
    icon: "🌱",
    short: "처음 만나는 주제",
    how: "한 번도 풀지 않은 키워드의 문제를, 평소 맵기보다 한 단계 순한 것부터 고릅니다.",
    empty: "아직 안 푼 새로운 주제가 없어요. 대단해요!",
    chip: "bg-emerald-100 text-emerald-700",
  },
  {
    v: "retry",
    label: "재도전",
    icon: "💪",
    short: "못 푼 문제 다시",
    how: "'못 풀겠어요'로 기록한 문제를 최근 순으로 보여줍니다. 막혔던 지점이 있으면 함께 표시해요.",
    empty: "못 푼 문제가 없어요. 풀이 중 '못 풀겠어요'를 누르면 여기에 나타납니다.",
    chip: "bg-violet-100 text-violet-700",
  },
  {
    v: "adapt",
    label: "맵기 적응",
    icon: "🌶",
    short: "내 실력에 맞춰 맵기 조절",
    how: "최근 풀이 5개의 성공률과 권장 시간 대비 속도를 보고, 목표 맵기를 한 단계 올리거나 내리거나 유지해서 그 맵기의 안 푼 문제를 고릅니다.",
    empty: "목표 맵기에 맞는 안 푼 문제가 없어요.",
    chip: "bg-orange-100 text-orange-700",
  },
  {
    v: "spaced",
    label: "간격 복습",
    icon: "⏳",
    short: "푼 문제를 다시 풀어보기",
    how: "푼 지 7일 이상 지난 문제를 다시 풀 후보로 올립니다. 여러 번 시도해서 푼 문제를 먼저, 그다음 오래된 순입니다.",
    empty: "다시 풀 시기가 된 문제가 아직 없어요 (푼 지 7일 이상).",
    chip: "bg-teal-100 text-teal-700",
  },
];

const MAX = 6;
const age = (d: string) => Math.round((TODAY.getTime() - new Date(d).getTime()) / 86400000);

/** 카탈로그에 이 앱에서 남긴 기록(상태/날짜)을 덮어씌운 현재 상태 */
export function effective(catalog: Problem[], records: Record<string, SolveRecord>): Problem[] {
  return catalog.map((p) => {
    const r = records[p.id];
    if (!r) return p;
    const day = r.at.slice(0, 10);
    return { ...p, status: r.status, lastDate: day, firstDate: p.firstDate || day, attempts: Math.max(p.attempts, 1) };
  });
}

function topics(list: Problem[]) {
  return ALL_TAGS.map((tag) => {
    const solved = list.filter((p) => p.status === "solved" && p.tags.includes(tag));
    const last = solved.map((p) => p.lastDate).sort().at(-1) ?? null;
    return {
      tag,
      solved: solved.length,
      idle: last ? age(last) : null,
      avgSpice: solved.length ? solved.reduce((a, p) => a + p.spice, 0) / solved.length : null,
    };
  });
}

function nearest(pool: Problem[], tag: string, target: number, used: Set<string>): Problem | undefined {
  return pool
    .filter((p) => p.tags.includes(tag) && !used.has(p.id))
    .sort((a, b) => Math.abs(a.spice - target) - Math.abs(b.spice - target) || a.title.localeCompare(b.title))[0];
}

const clamp = (n: number) => Math.min(5, Math.max(1, Math.round(n))) as Spice;

/** platforms: 추천 대상 플랫폼. 풀이 통계(복습/약점 판단)는 전체 기록을 쓰고, 추천되는 문제만 거른다. */
export function recommendBy(mode: RecMode, list: Problem[], records: Record<string, SolveRecord>, platforms: Platform[]): Recommendation[] {
  const ok = (p: Problem) => platforms.includes(p.platform);
  const pool = list.filter((p) => p.status === "unsolved" && ok(p));
  const stats = topics(list);
  const solvedList = list.filter((p) => p.status === "solved");
  const overall = solvedList.length ? solvedList.reduce((a, p) => a + p.spice, 0) / solvedList.length : 2;
  const used = new Set<string>();
  const out: Recommendation[] = [];
  const add = (problem: Problem | undefined, reason: string) => {
    if (problem && !used.has(problem.id) && out.length < MAX) {
      used.add(problem.id);
      out.push({ problem, reason });
    }
  };

  if (mode === "review") {
    stats
      .filter((t) => t.solved > 0 && t.idle !== null)
      .sort((a, b) => b.idle! - a.idle! || a.solved - b.solved)
      .forEach((t) => add(nearest(pool, t.tag, t.avgSpice ?? overall, used), `${t.tag} 마지막 풀이가 ${t.idle}일 전 · 같은 패턴 복습`));
  }

  if (mode === "weak") {
    stats
      .filter((t) => t.solved > 0)
      .sort((a, b) => a.solved - b.solved || (b.idle ?? 0) - (a.idle ?? 0))
      .forEach((t) => add(nearest(pool, t.tag, t.avgSpice ?? overall, used), `${t.tag} 풀이 ${t.solved}개로 적은 편`));
  }

  if (mode === "new") {
    const target = clamp(overall - 1);
    stats
      .filter((t) => t.solved === 0)
      .forEach((t) => add(nearest(pool, t.tag, target, used), `아직 풀어보지 않은 주제: ${t.tag}`));
  }

  if (mode === "retry") {
    list
      .filter((p) => p.status === "failed" && ok(p))
      .sort((a, b) => b.lastDate.localeCompare(a.lastDate))
      .forEach((p) => {
        const blocker = records[p.id]?.blocker;
        add(p, blocker ? `${p.lastDate}에 막힘 · 막혔던 지점: ${blocker}` : `${p.lastDate}에 풀지 못했어요`);
      });
  }

  if (mode === "adapt") {
    const spiceOf = new Map(list.map((p) => [p.id, p.spice]));
    const recent = Object.values(records)
      .filter((r) => spiceOf.has(r.problemId))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 5);
    const base = recent.length
      ? recent.reduce((a, r) => a + spiceOf.get(r.problemId)!, 0) / recent.length
      : solvedList.length
        ? [...solvedList].sort((a, b) => b.lastDate.localeCompare(a.lastDate)).slice(0, 5).reduce((a, p) => a + p.spice, 0) / Math.min(5, solvedList.length)
        : 2;
    let step = 0;
    let why = "기록이 적어 최근 풀던 맵기를 유지해요";
    if (recent.length >= 3) {
      const ok = recent.filter((r) => r.status === "solved");
      const slow = ok.filter((r) => r.analysis?.pace === "slow").length;
      const rate = ok.length / recent.length;
      const slowRatio = ok.length ? slow / ok.length : 0;
      const stat = `최근 ${recent.length}번 중 ${ok.length}번 성공`;
      if (rate >= 0.8 && slowRatio <= 0.34) {
        step = 1;
        why = `${stat}, 속도도 충분 → 한 단계 올려요`;
      }
      else if (rate <= 0.5 || slowRatio >= 0.67) {
        step = -1;
        why = `${stat}${slowRatio >= 0.67 ? ", 시간이 오래 걸림" : ""} → 한 단계 낮춰요`;
      }
      else why = `${stat} → 같은 맵기를 유지해요`;
    }
    const target = clamp(base + step);
    const solvedByTag = (p: Problem) => p.tags.reduce((a, t) => a + (stats.find((s) => s.tag === t)?.solved ?? 0), 0);
    [...pool]
      .sort((a, b) => Math.abs(a.spice - target) - Math.abs(b.spice - target) || solvedByTag(a) - solvedByTag(b) || a.title.localeCompare(b.title))
      .forEach((p) => add(p, `목표 🌶${target} · ${why}`));
  }

  if (mode === "spaced") {
    solvedList
      .filter((p) => ok(p) && age(p.lastDate) >= 7)
      .sort((a, b) => b.attempts - a.attempts || b.lastDate.localeCompare(a.lastDate) * -1)
      .forEach((p) => add(p, `${age(p.lastDate)}일 전에 풀었어요${p.attempts > 1 ? ` · ${p.attempts}번 만에 풀어서 한 번 더` : ""}`));
  }

  return out;
}
