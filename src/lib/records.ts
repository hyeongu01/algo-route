"use client";

import { useSyncExternalStore } from "react";
import type { Analysis, Lang } from "./solution";

/** 사용자가 풀이 화면에서 남긴 시도 1건. 백엔드 전까지는 이 브라우저의 localStorage에만 저장된다. */
export interface SolveRecord {
  problemId: string;
  status: "solved" | "failed";
  lang: Lang;
  memo: string;
  code: string;
  seconds: number;
  at: string; // ISO, 시도의 식별자
  analysis: Analysis | null;
  blocker?: string;
}

const KEY = "algo-route:records:v2"; // problemId -> 시도 목록
const KEY_V1 = "algo-route:records:v1"; // problemId -> 마지막 1건 (이전 버전)
const EVT = "algo-route:records";

interface Store {
  /** 문제별 전체 시도, 최신순 */
  attempts: Record<string, SolveRecord[]>;
  /** 문제별 대표 기록: 성공한 시도가 있으면 그중 최신, 없으면 최신 시도 */
  latest: Record<string, SolveRecord>;
}

const EMPTY_LIST: SolveRecord[] = [];
const EMPTY: Store = { attempts: {}, latest: {} };

function build(attempts: Record<string, SolveRecord[]>): Store {
  const latest: Record<string, SolveRecord> = {};
  for (const [id, list] of Object.entries(attempts)) {
    list.sort((a, b) => b.at.localeCompare(a.at));
    latest[id] = list.find((r) => r.status === "solved") ?? list[0];
  }
  return { attempts, latest };
}

let cacheRaw: string | null = null;
let cache: Store = EMPTY;

function load(): Record<string, SolveRecord[]> {
  const v2 = localStorage.getItem(KEY);
  if (v2) return JSON.parse(v2);
  const v1 = localStorage.getItem(KEY_V1);
  if (v1) {
    const old: Record<string, SolveRecord> = JSON.parse(v1);
    return Object.fromEntries(Object.entries(old).map(([id, r]) => [id, [r]]));
  }
  return {};
}

function read(): Store {
  try {
    const raw = (localStorage.getItem(KEY) ?? "") + "|" + (localStorage.getItem(KEY_V1) ?? "");
    if (raw !== cacheRaw) {
      cacheRaw = raw;
      cache = build(load());
    }
  } catch {
    // 저장소 접근 불가/손상된 JSON: 마지막 정상 캐시를 유지
  }
  return cache;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVT, cb);
  };
}

/** 문제별 대표 기록 (푼 문제 목록, 상태 표시용) */
export function useRecords(): Record<string, SolveRecord> {
  return useSyncExternalStore(subscribe, () => read().latest, () => EMPTY.latest);
}

/** 한 문제의 모든 시도, 최신순 */
export function useAttempts(problemId: string): SolveRecord[] {
  return useSyncExternalStore(subscribe, () => read().attempts[problemId] ?? EMPTY_LIST, () => EMPTY_LIST);
}

/** 시도를 추가한다. 같은 problemId + at 이면 그 시도를 갱신(예: 포기 후 막힌 지점 추가). */
export function saveRecord(r: SolveRecord) {
  try {
    const attempts = { ...read().attempts };
    attempts[r.problemId] = [r, ...(attempts[r.problemId] ?? []).filter((x) => x.at !== r.at)];
    localStorage.setItem(KEY, JSON.stringify(attempts));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(EVT));
}
