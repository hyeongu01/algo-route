import { problems } from "@/data/problems";
import { candidates } from "@/data/candidates";
import { otherUsers } from "@/data/users";
import { feedbackFor } from "@/data/feedback";
import type { Problem, RankUser, Spice, SpiceFeedback } from "./types";

export const TODAY = new Date("2026-11-17");
export const POINTS: Record<Spice, number> = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 6 };
export const ALL_TAGS = [
  "array", "string", "hash-map", "two-pointers", "sliding-window", "stack", "queue", "heap",
  "linked-list", "tree", "recursion", "math", "prefix-sum", "greedy", "sorting",
  "binary-search", "dp", "graph", "backtracking", "trie", "union-find",
];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (d: string) => Math.round((TODAY.getTime() - new Date(d).getTime()) / 86400000);
const solved = () => problems.filter((p) => p.status === "solved");

export function summary() {
  const s = solved();
  const bySpice = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<Spice, number>;
  const byPlatform = { leetcode: 0, programmers: 0 };
  s.forEach((p) => {
    bySpice[p.spice]++;
    byPlatform[p.platform]++;
  });
  const score = s.reduce((a, p) => a + POINTS[p.spice], 0);
  const days = new Set(s.map((p) => p.firstDate));
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = iso(new Date(TODAY.getTime() - i * 86400000));
    if (days.has(d)) streak++;
    else if (i > 0) break;
  }
  return { solved: s.length, total: problems.length, bySpice, byPlatform, score, streak, activeDays: days.size };
}

export function topicStats() {
  return ALL_TAGS.map((tag) => {
    const ps = problems.filter((p) => p.tags.includes(tag));
    const sv = ps.filter((p) => p.status === "solved");
    const last = sv.map((p) => p.lastDate).sort().at(-1) ?? null;
    return { tag, solved: sv.length, unsolved: ps.length - sv.length, last, idle: last ? daysAgo(last) : null };
  });
}

export function monthly() {
  const m: Record<string, number> = {};
  solved().forEach((p) => {
    const k = p.firstDate.slice(0, 7);
    m[k] = (m[k] ?? 0) + 1;
  });
  return Object.entries(m).sort().map(([month, count]) => ({ month, count }));
}

export function heatmap(weeks = 26) {
  const counts: Record<string, number> = {};
  solved().forEach((p) => {
    counts[p.firstDate] = (counts[p.firstDate] ?? 0) + 1;
  });
  const end = new Date(TODAY);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const cols: { date: string; count: number }[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(end.getTime() - (w * 7 + (6 - d)) * 86400000);
      col.push({ date: iso(dt), count: dt > TODAY ? -1 : counts[iso(dt)] ?? 0 });
    }
    cols.push(col);
  }
  return cols;
}

export function ranking(): RankUser[] {
  const s = summary();
  const week = solved().filter((p) => daysAgo(p.firstDate) < 7).length;
  const me: RankUser = {
    name: "나 (hyeonwoo)",
    solved: s.solved,
    score: s.score,
    weekly: week,
    streak: s.streak,
    platforms: ["leetcode", "programmers"],
    me: true,
  };
  return [...otherUsers, me].sort((a, b) => b.score - a.score);
}

export function recent(n = 6): Problem[] {
  return [...solved()].sort((a, b) => b.firstDate.localeCompare(a.firstDate)).slice(0, n);
}

/** 전체 문제 카탈로그: 내 기록 + 아직 시도하지 않은 후보 문제(unsolved). */
export function catalog(): Problem[] {
  const seen = new Set(problems.map((p) => p.id));
  const rest: Problem[] = candidates
    .filter((c) => !seen.has(c.id))
    .map((c) => ({ ...c, status: "unsolved", attempts: 0, firstDate: "", lastDate: "" }));
  return [...problems, ...rest];
}

export const AUDIT_RULE = { MIN_VOTES: 10, THRESHOLD: 0.3 };

export type Verdict = "insufficient" | "raise" | "lower" | "ok";

export interface SpiceAudit {
  problem: Problem;
  feedback: SpiceFeedback;
  votes: number;
  /** (더 매워요 - 덜 매워요) / 전체. +면 실제론 더 어려움, -면 더 쉬움. */
  skew: number;
  fitRate: number;
  verdict: Verdict;
  suggested: Spice;
}

/** 관리자용: 체감 투표로 현재 맵기 등급이 적절한지 판단. */
export function spiceAudit(): SpiceAudit[] {
  return catalog().map((problem) => {
    const feedback = feedbackFor(problem.id);
    const votes = feedback.easier + feedback.fit + feedback.harder;
    const skew = votes ? (feedback.harder - feedback.easier) / votes : 0;
    const verdict: Verdict =
      votes < AUDIT_RULE.MIN_VOTES ? "insufficient" : skew >= AUDIT_RULE.THRESHOLD ? "raise" : skew <= -AUDIT_RULE.THRESHOLD ? "lower" : "ok";
    const step = verdict === "raise" ? 1 : verdict === "lower" ? -1 : 0;
    const suggested = Math.min(5, Math.max(1, problem.spice + step)) as Spice;
    return { problem, feedback, votes, skew, fitRate: votes ? feedback.fit / votes : 0, verdict, suggested };
  });
}

export function getProblem(id: string): Problem | undefined {
  return catalog().find((p) => p.id === id);
}

/** 내 맵기: 푼 문제 맵기의 평균(전체)과 최근 N문제 평균. 1(순한맛) ~ 5(극강). */
export function mySpice(recentN = 10) {
  const s = solved();
  if (!s.length) return null;
  const mean = (l: Problem[]) => l.reduce((a, p) => a + p.spice, 0) / l.length;
  const latest = [...s].sort((a, b) => b.firstDate.localeCompare(a.firstDate)).slice(0, recentN);
  return { avg: mean(s), recent: mean(latest), recentN: latest.length };
}
