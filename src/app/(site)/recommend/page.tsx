import RecommendClient from "@/components/RecommendClient";
import { catalog, mySpice, ranking, summary } from "@/lib/analysis";
import { spiceInfo } from "@/lib/spice";
import type { Spice } from "@/lib/types";

export default function Recommend() {
  const s = summary();
  const sp = mySpice();
  const weekly = ranking().find((u) => u.me)?.weekly ?? 0;
  const ramen = sp ? spiceInfo(Math.min(5, Math.max(1, Math.round(sp.avg))) as Spice).ramen : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">오늘의 추천</h1>
      <RecommendClient catalog={catalog()} stats={{ streak: s.streak, weekly, avg: sp?.avg ?? null, ramen }} />
    </div>
  );
}
