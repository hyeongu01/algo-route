/** 온보딩으로 정한 초기 맵기와, 풀이가 쌓이면서 그 영향력이 사라지는 규칙 (순수 함수만 — 서버/클라이언트 공용) */
import type { Spice } from "./types";

export interface Prior {
  /** 온보딩에서 추정한 초기 맵기 (1~5) */
  spice: number;
  /** 이 서비스에서 푼 문제 수 */
  solves: number;
}

/** 이만큼 풀면 초기 맵기의 영향력이 0이 된다. */
export const FADE_SOLVES = 20;

/** 초기 맵기의 영향력: 0문제 100% → 선형 감소 → FADE_SOLVES문제 0% */
export const priorWeight = (solves: number) => Math.min(1, Math.max(0, 1 - solves / FADE_SOLVES));

/** 실제 풀이 평균(measured)에 초기 맵기를 영향력만큼 섞는다. 둘 다 없으면 fallback. */
export function blendSpice(measured: number | null, prior: Prior | null, fallback = 2): number {
  if (!prior) return measured ?? fallback;
  if (measured === null) return prior.spice;
  const w = priorWeight(prior.solves);
  return w * prior.spice + (1 - w) * measured;
}

export interface ProbeAnswer {
  problemId: string;
  spice: Spice;
  /** true: 쉬웠어요, false: 쉽지 않았어요 */
  easy: boolean;
}

/**
 * "쉬워요/안 쉬워요" 답변으로 초기 맵기를 추정한다.
 * 컷오프 c(0~5)를 가정: 맵기 ≤ c 는 쉽고 > c 는 쉽지 않다. 답과 어긋나는 문제 수가 가장 적은 c를 고르고,
 * 동률이면 그 평균을 쓴다(일관되지 않은 답변에도 안정적). 결과는 c + 0.5, 1~5로 제한.
 */
export function estimateSpice(answers: ProbeAnswer[]): number {
  if (!answers.length) return 2;
  let best = Infinity;
  let cuts: number[] = [];
  for (let c = 0; c <= 5; c++) {
    const miss = answers.filter((a) => a.easy !== a.spice <= c).length;
    if (miss < best) {
      best = miss;
      cuts = [c];
    } else if (miss === best) cuts.push(c);
  }
  const cut = cuts.reduce((a, b) => a + b, 0) / cuts.length;
  return Math.min(5, Math.max(1, cut + 0.5));
}
