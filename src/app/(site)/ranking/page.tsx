import { Card } from "@/components/ui";
import { ranking } from "@/lib/analysis";
import type { RankUser } from "@/lib/types";

function Table({ data, metric, label }: { data: RankUser[]; metric: "score" | "weekly"; label: string }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
          <th className="py-2 pr-2">#</th>
          <th>사용자</th>
          <th className="text-right">{label}</th>
          <th className="text-right">푼 문제</th>
          <th className="text-right">연속</th>
        </tr>
      </thead>
      <tbody>
        {data.map((u, i) => (
          <tr key={u.name} className={`border-b border-gray-50 ${u.me ? "bg-indigo-50 font-semibold" : ""}`}>
            <td className="py-2 pr-2">{i + 1}</td>
            <td>{u.name}</td>
            <td className="text-right">{u[metric]}</td>
            <td className="text-right text-gray-500">{u.solved}</td>
            <td className="text-right text-gray-500">{u.streak}일</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Ranking() {
  const rows = ranking();
  const weekly = [...rows].sort((a, b) => b.weekly - a.weekly);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">랭킹</h1>
        <p className="mt-1 text-sm text-gray-500">다른 사용자는 가상 데이터, 내 기록은 실제 풀이 기록입니다.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="전체 점수">
          <Table data={rows} metric="score" label="점수" />
        </Card>
        <Card title="이번 주 풀이">
          <Table data={weekly} metric="weekly" label="주간" />
        </Card>
      </div>
    </div>
  );
}
