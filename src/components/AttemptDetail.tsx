import AnalysisView from "@/components/AnalysisView";
import Markdown from "@/components/Markdown";
import type { SolveRecord } from "@/lib/records";
import { LANGS } from "@/lib/solution";

/** 한 번의 시도: 메모, 내 풀이, 분석 결과. record가 없으면(시드 데이터) 안내만 보여준다. */
export default function AttemptDetail({ record: r, compact = false }: { record?: SolveRecord; compact?: boolean }) {
  return (
    <div className="space-y-5">
      {r?.blocker && <div className="text-sm text-rose-600">막혔던 지점: {r.blocker}</div>}

      <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}>
        <section>
          <h3 className="mb-1 text-xs font-semibold text-gray-500">내 메모</h3>
          {r?.memo ? (
            <div className="rounded-md border border-gray-200 bg-white p-3 text-sm">
              <Markdown text={r.memo} />
            </div>
          ) : (
            <p className="text-sm text-gray-400">저장된 메모가 없어요.</p>
          )}
        </section>
        <section>
          <h3 className="mb-1 text-xs font-semibold text-gray-500">내 풀이{r?.code ? ` (${LANGS.find((l) => l.v === r.lang)?.label})` : ""}</h3>
          {r?.code ? (
            <pre className="max-h-64 overflow-auto rounded-md border border-gray-200 bg-white p-3 font-mono text-xs">{r.code}</pre>
          ) : (
            <p className="text-sm text-gray-400">저장된 풀이가 없어요.</p>
          )}
        </section>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold text-gray-500">분석 결과</h3>
        {r?.analysis ? (
          <div className={`rounded-md border border-gray-200 bg-white ${compact ? "p-3" : "p-4"}`}>
            <AnalysisView analysis={r.analysis} compact={compact} />
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            {r ? "분석 없이 기록된 풀이예요." : "이 앱에서 풀이한 기록이 아니라 메모·풀이·분석이 없어요. 다시 풀면 저장됩니다."}
          </p>
        )}
      </section>
    </div>
  );
}
