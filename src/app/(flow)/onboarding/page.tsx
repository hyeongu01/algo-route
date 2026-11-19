import OnboardingClient, { type Probe } from "@/components/OnboardingClient";
import { catalog } from "@/lib/analysis";
import type { Spice } from "@/lib/types";

export const metadata = { title: "초기 맵기 설정 · algo-route" };

const PER_LEVEL = 2;

/** 맵기 단계마다 최대 PER_LEVEL개씩, 플랫폼이 번갈아 나오도록 고른다. 순서는 쉬운 것 → 어려운 것. */
function pickProbes(): Probe[] {
  const all = catalog().sort((a, b) => a.id.localeCompare(b.id));
  const out: Probe[] = [];
  for (const level of [1, 2, 3, 4, 5] as Spice[]) {
    const pool = all.filter((p) => p.spice === level && p.url);
    const picked: typeof pool = [];
    for (const platform of ["leetcode", "programmers"] as const) {
      const p = pool.find((x) => x.platform === platform);
      if (p && picked.length < PER_LEVEL) picked.push(p);
    }
    for (const p of pool) if (picked.length < PER_LEVEL && !picked.includes(p)) picked.push(p);
    out.push(...picked.map((p) => ({ id: p.id, title: p.title, platform: p.platform, tags: p.tags, url: p.url!, spice: p.spice })));
  }
  return out;
}

export default function Onboarding() {
  return <OnboardingClient probes={pickProbes()} />;
}
