import { Card, PlatformBadge, SpiceBadge, Stat } from "@/components/ui";
import { AUDIT_RULE, spiceAudit, type Verdict } from "@/lib/analysis";

const VERDICT: Record<Verdict, { label: string; chip: string; order: number }> = {
  raise: { label: "맵기 상향 검토", chip: "bg-red-100 text-red-700", order: 0 },
  lower: { label: "맵기 하향 검토", chip: "bg-sky-100 text-sky-700", order: 1 },
  ok: { label: "적정", chip: "bg-emerald-100 text-emerald-700", order: 2 },
  insufficient: { label: "표본 부족", chip: "bg-gray-100 text-gray-500", order: 3 },
};

export default function AdminDifficulty() {
  const rows = spiceAudit().sort(
    (a, b) => VERDICT[a.verdict].order - VERDICT[b.verdict].order || Math.abs(b.skew) - Math.abs(a.skew),
  );
  const count = (v: Verdict) => rows.filter((r) => r.verdict === v).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">난이도 관리 (관리자)</h1>
        <p className="mt-1 text-sm text-gray-500">
          문제를 푼 사용자의 &ldquo;얼마나 매웠나요?&rdquo; 투표로 현재 맵기 등급이 적절한지 판단합니다. 투표는 가상 데이터이고, 등급 수정 기능은 추후 추가됩니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="상향 검토" value={count("raise")} />
        <Stat label="하향 검토" value={count("lower")} />
        <Stat label="적정" value={count("ok")} />
        <Stat label="표본 부족" value={count("insufficient")} sub={`투표 ${AUDIT_RULE.MIN_VOTES}건 미만`} />
      </div>

      <Card title="판단 기준">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>쏠림 지수 = (더 매워요 − 덜 매워요) ÷ 전체 투표. +면 현재 등급보다 실제로 더 어렵다는 뜻.</li>
          <li>투표 {AUDIT_RULE.MIN_VOTES}건 이상이고 쏠림 지수가 +{AUDIT_RULE.THRESHOLD} 이상이면 상향, −{AUDIT_RULE.THRESHOLD} 이하면 하향 검토 (한 단계씩 제안).</li>
          <li>&lsquo;딱 좋아요&rsquo; 비율이 높을수록 현재 등급이 적절합니다.</li>
        </ul>
      </Card>

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                <th className="px-5 py-2">문제</th>
                <th>현재 맵기</th>
                <th className="w-56">투표 분포 (덜 / 딱 / 더)</th>
                <th className="text-right">투표</th>
                <th className="text-right">쏠림</th>
                <th className="px-5">판정</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ problem: p, feedback: f, votes, skew, verdict, suggested }) => (
                <tr key={p.id} className="border-b border-gray-50 align-middle">
                  <td className="px-5 py-2">
                    <div className="flex items-center gap-2">
                      <PlatformBadge p={p.platform} />
                      <span>{p.title}</span>
                    </div>
                  </td>
                  <td><SpiceBadge s={p.spice} /></td>
                  <td>
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-100" title={`덜 ${f.easier} · 딱 ${f.fit} · 더 ${f.harder}`}>
                      <div className="bg-sky-400" style={{ width: `${(f.easier / votes) * 100}%` }} />
                      <div className="bg-emerald-400" style={{ width: `${(f.fit / votes) * 100}%` }} />
                      <div className="bg-red-400" style={{ width: `${(f.harder / votes) * 100}%` }} />
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">
                      {f.easier} / {f.fit} / {f.harder}
                    </div>
                  </td>
                  <td className="text-right text-gray-500">{votes}</td>
                  <td className="text-right tabular-nums">{skew > 0 ? "+" : ""}{skew.toFixed(2)}</td>
                  <td className="px-5">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${VERDICT[verdict].chip}`}>{VERDICT[verdict].label}</span>
                    {suggested !== p.spice && <span className="ml-2 text-xs text-gray-500">→ 🌶{suggested}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
