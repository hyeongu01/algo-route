"use client";

import { useMemo, useSyncExternalStore } from "react";
import { priorWeight, type Prior, type ProbeAnswer } from "./initial-spice";
import { useRecords } from "./records";

/** 가입 정보 (목업: 이 브라우저의 localStorage에만 저장. 비밀번호는 저장하지 않는다.) */
export interface Profile {
  name: string;
  email: string;
  at: string;
}

/** 온보딩 결과 */
export interface Onboarding {
  spice: number;
  answers: ProbeAnswer[];
  at: string;
}

const EVT = "algo-route:onboarding";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVT, cb);
  };
}

/** localStorage 한 키를 useSyncExternalStore로 읽는 스토어. 같은 원문이면 같은 객체를 돌려준다. */
function createStore<T>(key: string, valid: (v: unknown) => v is T) {
  let raw: string | null = null;
  let cache: T | null = null;
  const read = () => {
    try {
      const r = localStorage.getItem(key) ?? "";
      if (r !== raw) {
        raw = r;
        try {
          const v = r ? JSON.parse(r) : null;
          cache = valid(v) ? v : null;
        } catch {
          cache = null;
        }
      }
    } catch {}
    return cache;
  };
  return {
    use: () => useSyncExternalStore(subscribe, read, () => null),
    set(v: T) {
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {
        return;
      }
      window.dispatchEvent(new Event(EVT));
    },
    clear() {
      try {
        localStorage.removeItem(key);
      } catch {
        return;
      }
      window.dispatchEvent(new Event(EVT));
    },
  };
}

const obj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const profileStore = createStore<Profile>("algo-route:profile", (v): v is Profile => obj(v) && typeof v.name === "string" && typeof v.email === "string");
const onboardingStore = createStore<Onboarding>(
  "algo-route:onboarding:v1",
  (v): v is Onboarding => obj(v) && typeof v.spice === "number" && v.spice >= 1 && v.spice <= 5 && Array.isArray(v.answers),
);

export const useProfile = profileStore.use;
export const saveProfile = profileStore.set;
export const useOnboarding = onboardingStore.use;
export const saveOnboarding = onboardingStore.set;

/** 로그아웃: 계정에 딸린 가입 정보와 초기 맵기를 지운다. 풀이 기록과 화면 설정은 이 브라우저에 남긴다. */
export function logout() {
  profileStore.clear();
  onboardingStore.clear();
}

/**
 * 추천에 쓰는 초기 맵기. 온보딩 전이면 null.
 * 풀이 수는 이 앱에서 푼(성공 기록한) 문제 수 — 가입 이후 쌓은 풀이만 센다.
 */
export function usePrior(): { prior: Prior | null; weight: number } {
  const onboarding = useOnboarding();
  const records = useRecords();
  const solves = useMemo(() => Object.values(records).filter((r) => r.status === "solved").length, [records]);
  const spice = onboarding?.spice ?? null;
  return useMemo(() => (spice === null ? { prior: null, weight: 0 } : { prior: { spice, solves }, weight: priorWeight(solves) }), [spice, solves]);
}
