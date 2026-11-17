import { fmtTime, LANGS, type Analysis } from "@/lib/solution";

const PACE = {
  fast: { label: "권장 시간보다 빠름", chip: "bg-emerald-100 text-emerald-700" },
  normal: { label: "권장 시간 내", chip: "bg-sky-100 text-sky-700" },
  slow: { label: "권장 시간 초과", chip: "bg-amber-100 text-amber-700" },
};

export default function AnalysisView({ analysis, compact = false }: { analysis: Analysis; compact?: boolean }) {
  return (
    <div>
      <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        목업 분석입니다. 코드 텍스트를 규칙으로 훑은 추정 결과이며, 정답 여부는 판정하지 않습니다. 추후 AI 분석으로 교체됩니다.
      </p>
      <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-3"}`}>
        <div>
          <div className="text-xs text-gray-500">소요 시간</div>
          <div className="text-2xl font-bold">{fmtTime(analysis.seconds)}</div>
          <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${PACE[analysis.pace].chip}`}>
            {PACE[analysis.pace].label} (권장 {analysis.expectedMin}분)
          </span>
        </div>
        <div>
          <div className="text-xs text-gray-500">추정 시간 복잡도</div>
          <div className="text-lg font-semibold">{analysis.complexity}</div>
          <div className="mt-1 text-xs text-gray-400">
            {LANGS.find((l) => l.v === analysis.lang)?.label} · {analysis.lines}줄 · 반복문 중첩 {analysis.loopDepth} · 재귀 {analysis.recursion ? "있음" : "없음"}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-500">키워드 패턴</div>
          <div className="flex flex-wrap gap-1">
            {analysis.patterns.map((p) => (
              <span key={p.tag} className={`rounded-full px-2 py-0.5 text-xs ${p.found ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {p.found ? "✓" : "–"} {p.tag}
              </span>
            ))}
            {analysis.unchecked.map((t) => (
              <span key={t} className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-400" title="자동 감지 대상이 아닌 키워드">
                ? {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
        {analysis.tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
