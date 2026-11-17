import type { Spice } from "./types";

// 목업 분석: 실제 AI 분석을 붙이기 전까지 코드 텍스트를 휴리스틱으로 훑는다.
// 정확한 복잡도 판정이 아니라 "추정"이며, 화면에도 그렇게 표기한다.

/** 맵기별 권장 풀이 시간(분). */
export const EXPECTED_MIN: Record<Spice, number> = { 1: 15, 2: 25, 3: 40, 4: 60, 5: 90 };

export type Lang = "java" | "python" | "cpp" | "javascript";
export const LANGS: { v: Lang; label: string }[] = [
  { v: "java", label: "Java" },
  { v: "python", label: "Python" },
  { v: "cpp", label: "C++" },
  { v: "javascript", label: "JavaScript" },
];

/** 코드 모양으로 언어를 대충 추측. 확신이 없으면 null. */
function guessLang(code: string): Lang | null {
  if (/#include|std::|\bvector\s*</.test(code)) return "cpp";
  if (/\bpublic\s+(class|static)|System\.out|\bString\[\]|\bnew\s+\w+<.*>\(/.test(code)) return "java";
  if (/^\s*def\s+\w+\(.*\)\s*(->.*)?:/m.test(code) || /^\s*(elif|import\s+\w+$|from\s+\w+\s+import)\b/m.test(code)) return "python";
  if (/\bconst\b|\blet\b|=>|\bfunction\b/.test(code)) return "javascript";
  return null;
}

const DETECTORS: Record<string, RegExp> = {
  "hash-map": /\bdict\b|\{\s*\}|Map\s*[<(]|unordered_map|HashMap|defaultdict|Counter|\bmap\[/,
  stack: /\bstack\b|\.push\(|\.pop\(/i,
  queue: /deque|\bqueue\b|\.shift\(|\.popleft\(/i,
  heap: /heapq|PriorityQueue|priority_queue|\bheap\b/i,
  sorting: /\bsort(ed)?\b|\.sort\(|Arrays\.sort|std::sort/,
  "binary-search": /\bmid\b|bisect|binarySearch/,
  "two-pointers": /\b(left|lo|l|start)\b[\s\S]*\b(right|hi|r|end)\b/,
  "sliding-window": /window|\bleft\b[\s\S]*\bright\b/i,
  dp: /\bdp\b|memo|lru_cache|\bcache\b/i,
  graph: /graph|adj|visited|\bbfs\b|\bdfs\b|neighbors/i,
  tree: /TreeNode|\.left\b|\.right\b|\broot\b/,
  "linked-list": /ListNode|\.next\b/,
  backtracking: /backtrack|\bpath\.pop\(|\.pop\(\)\s*#?\s*(undo|backtrack)/i,
  "prefix-sum": /prefix|accumulate|presum/i,
  "union-find": /\bparent\b|\bfind\(|\bunion\(/,
  trie: /trie|children\[/i,
};

export interface PatternCheck {
  tag: string;
  found: boolean;
}

export interface Analysis {
  lang: Lang;
  lines: number;
  seconds: number;
  expectedMin: number;
  pace: "fast" | "normal" | "slow";
  loopDepth: number;
  recursion: boolean;
  memo: boolean;
  complexity: string;
  patterns: PatternCheck[];
  unchecked: string[];
  tips: string[];
}

function loopDepth(code: string): number {
  const open: number[] = [];
  let max = 0;
  for (const raw of code.split("\n")) {
    if (!raw.trim()) continue;
    const indent = raw.length - raw.trimStart().length;
    const t = raw.trim();
    const closer = /^[})\]]/.test(t);
    if (!closer) while (open.length && open[open.length - 1] >= indent) open.pop();
    if (/^(for|while)\b/.test(t) || /^\}?\s*(for|while)\s*\(/.test(t) || /\.(forEach)\(/.test(t)) {
      open.push(indent);
      max = Math.max(max, open.length);
    }
  }
  return max;
}

function hasRecursion(code: string, lang: Lang): boolean {
  const names = new Set<string>();
  const add = (re: RegExp) => { for (const m of code.matchAll(re)) names.add(m[1]); };
  if (lang === "python") add(/def\s+([A-Za-z_]\w*)\s*\(/g);
  else if (lang === "javascript") {
    add(/function\s+([A-Za-z_$][\w$]*)\s*\(/g);
    add(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>|[\w$]+\s*=>)/g);
  } else add(/\b(?:int|long|void|bool|boolean|double|String|auto|List<[^>]+>|vector<[^>]+>)\s+([A-Za-z_]\w*)\s*\([^)]*\)\s*(?:const\s*)?\{/g);
  for (const n of names) {
    if (n === "solution" || n === "main") continue;
    const esc = n.replace(/[$]/g, "\\$&");
    const calls = code.match(new RegExp("(?<![\\w$])" + esc + "\\s*\\(", "g"))?.length ?? 0;
    if (calls >= 2) return true;
  }
  return false;
}

export function analyze(code: string, seconds: number, spice: Spice, tags: string[], lang: Lang = "python"): Analysis {
  const depth = loopDepth(code);
  const recursion = hasRecursion(code, lang);
  const memo = /lru_cache|memo|\bcache\b|\bdp\b/i.test(code);
  const sorts = DETECTORS.sorting.test(code);

  let complexity: string;
  if (recursion && !memo) complexity = depth >= 1 ? "O(2ⁿ) 이상 가능성 (메모 없는 재귀 + 반복)" : "O(2ⁿ) 가능성 (메모 없는 재귀)";
  else if (depth === 0) complexity = sorts ? "O(n log n)" : recursion ? "O(n) 내외 (메모 재귀)" : "O(1) ~ O(n)";
  else if (depth === 1) complexity = sorts ? "O(n log n)" : "O(n)";
  else if (depth === 2) complexity = "O(n²)";
  else complexity = `O(n^${depth})`;

  const patterns: PatternCheck[] = [];
  const unchecked: string[] = [];
  for (const tag of tags) {
    if (tag === "recursion") patterns.push({ tag, found: recursion });
    else if (DETECTORS[tag]) patterns.push({ tag, found: DETECTORS[tag].test(code) });
    else unchecked.push(tag);
  }

  const expectedMin = EXPECTED_MIN[spice];
  const min = seconds / 60;
  const pace = min <= expectedMin * 0.7 ? "fast" : min <= expectedMin * 1.3 ? "normal" : "slow";

  const tips: string[] = [];
  const guessed = guessLang(code);
  if (guessed && guessed !== lang) tips.push(`선택한 언어(${LANGS.find((l) => l.v === lang)!.label})와 달리 ${LANGS.find((l) => l.v === guessed)!.label} 코드처럼 보여요. 언어 선택이 맞는지 확인해주세요.`);
  if (depth >= 2) tips.push("중첩 반복문이 보여요. 해시맵·정렬·투 포인터로 한 겹 줄일 수 있는지 살펴보세요.");
  if (recursion && !memo) tips.push("재귀 호출이 반복될 수 있어요. 같은 인자를 다시 계산한다면 메모이제이션을 고려해보세요.");
  const missing = patterns.filter((p) => !p.found).map((p) => p.tag);
  if (missing.length) tips.push(`이 문제의 대표 키워드(${missing.join(", ")}) 패턴이 코드에서 보이지 않아요. 다른 접근으로 푼 거라면 비교해보면 좋아요.`);
  if (pace === "slow") tips.push(`권장 시간(${expectedMin}분)보다 오래 걸렸어요. 막혔던 지점을 메모에 정리해두면 복습할 때 도움이 돼요.`);
  if (pace === "fast") tips.push("권장 시간보다 빨리 풀었어요! 이 맵기가 너무 순하게 느껴졌다면 아래에서 알려주세요.");
  if (!tips.length) tips.push("눈에 띄는 개선 포인트는 발견되지 않았어요. 엣지 케이스(빈 입력, 중복 값)만 한 번 더 확인해보세요.");

  return {
    lang,
    lines: code.split("\n").filter((l) => l.trim()).length,
    seconds,
    expectedMin,
    pace,
    loopDepth: depth,
    recursion,
    memo,
    complexity,
    patterns,
    unchecked,
    tips,
  };
}

export function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
