"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "./solution";
import type { Platform } from "./types";

export type ThemeId = "light" | "dark" | "ramen" | "mint";

/** colors: [페이지 배경, 카드, 포인트] — 미리보기용 */
export const THEMES: { id: ThemeId; label: string; desc: string; colors: [string, string, string] }[] = [
  { id: "light", label: "라이트", desc: "기본 · 인디고 포인트", colors: ["#f9fafb", "#ffffff", "#4f46e5"] },
  { id: "dark", label: "다크", desc: "눈이 편한 어두운 화면", colors: ["#0b1020", "#121a2b", "#6c70f3"] },
  { id: "ramen", label: "라면", desc: "따뜻한 크림 · 매콤한 레드", colors: ["#fffaf5", "#ffffff", "#d93a14"] },
  { id: "mint", label: "민트", desc: "차분한 숲 · 에메랄드", colors: ["#f4faf7", "#ffffff", "#059669"] },
];

export const THEME_KEY = "algo-route:theme";
const LANG_KEY = "algo-route:lang";
const EVT = "algo-route:prefs";
const LANG_IDS: Lang[] = ["java", "python", "cpp", "javascript"];

const isTheme = (v: unknown): v is ThemeId => THEMES.some((t) => t.id === v);

function apply(t: ThemeId) {
  if (t === "light") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}

function subscribe(cb: () => void) {
  const onStorage = () => {
    // 다른 탭에서 바꾼 테마를 이 탭에도 반영
    try {
      const t = localStorage.getItem(THEME_KEY);
      apply(isTheme(t) ? t : "light");
    } catch {}
    cb();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVT, cb);
  };
}

export function useTheme(): ThemeId {
  return useSyncExternalStore(
    subscribe,
    () => {
      const t = document.documentElement.dataset.theme;
      return isTheme(t) ? t : "light";
    },
    () => "light",
  );
}

export function setTheme(t: ThemeId) {
  apply(t);
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

/** 풀이 화면에서 처음 선택돼 있는 언어 */
export function useDefaultLang(): Lang {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        const v = localStorage.getItem(LANG_KEY);
        return LANG_IDS.includes(v as Lang) ? (v as Lang) : "python";
      } catch {
        return "python";
      }
    },
    () => "python",
  );
}

export function setDefaultLang(l: Lang) {
  try {
    localStorage.setItem(LANG_KEY, l);
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

export const PLATFORMS: { id: Platform; label: string; desc: string }[] = [
  { id: "leetcode", label: "LeetCode", desc: "영문 · 글로벌 코딩 인터뷰 대비" },
  { id: "programmers", label: "프로그래머스", desc: "한글 · 국내 코딩테스트 대비" },
];
const PLATFORM_KEY = "algo-route:platforms";
const ALL_PLATFORMS: Platform[] = PLATFORMS.map((p) => p.id);

let platRaw: string | null = null;
let platCache: Platform[] = ALL_PLATFORMS;

/** 추천 등에 쓰는 플랫폼. 저장된 게 없으면 전부. 항상 1개 이상. */
export function usePlatforms(): Platform[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        const raw = localStorage.getItem(PLATFORM_KEY) ?? "";
        if (raw !== platRaw) {
          platRaw = raw;
          const list = (raw ? JSON.parse(raw) : []).filter((p: string) => ALL_PLATFORMS.includes(p as Platform));
          platCache = list.length ? list : ALL_PLATFORMS;
        }
      } catch {}
      return platCache;
    },
    () => ALL_PLATFORMS,
  );
}

export function setPlatforms(list: Platform[]) {
  if (!list.length) return;
  try {
    localStorage.setItem(PLATFORM_KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

export type EditorSizeId = "sm" | "md" | "lg";
/** 폰트 종류가 아니라 크기만 고른다. memoPx: 메모장, codePx: 풀이 코드 */
export const EDITOR_SIZES: { id: EditorSizeId; label: string; memoPx: number; codePx: number }[] = [
  { id: "sm", label: "작게", memoPx: 13, codePx: 12 },
  { id: "md", label: "중간", memoPx: 15, codePx: 14 },
  { id: "lg", label: "크게", memoPx: 18, codePx: 17 },
];
const SIZE_KEY = "algo-route:editor-size";

export function useEditorSize(): EditorSizeId {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        const v = localStorage.getItem(SIZE_KEY);
        return EDITOR_SIZES.some((s) => s.id === v) ? (v as EditorSizeId) : "md";
      } catch {
        return "md";
      }
    },
    () => "md",
  );
}

export function setEditorSize(id: EditorSizeId) {
  try {
    localStorage.setItem(SIZE_KEY, id);
  } catch {}
  window.dispatchEvent(new Event(EVT));
}

/** 첫 페인트 전에 저장된 테마를 적용하는 인라인 스크립트 (깜빡임 방지) */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="ramen"||t==="mint")document.documentElement.dataset.theme=t}catch(e){}`;
