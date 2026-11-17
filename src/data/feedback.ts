import type { SpiceFeedback } from "@/lib/types";

// Mock crowd feedback ("매운 정도가 어땠나요?"), deterministic per problem id.
// Real service: aggregate from per-user votes stored after a user solves a problem.
function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function feedbackFor(id: string): SpiceFeedback {
  const h = hash(id);
  const total = 4 + (h % 46);
  const bias = (((h >>> 5) % 9) - 4) / 4; // -1(너무 순함) .. +1(너무 매움)
  const clamp = (v: number) => Math.min(0.7, Math.max(0.05, v));
  const harder = Math.round(total * clamp(0.25 + 0.3 * bias));
  const easier = Math.round(total * clamp(0.25 - 0.3 * bias));
  return { easier, harder, fit: Math.max(0, total - harder - easier) };
}
