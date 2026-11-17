import Link from "next/link";
import { Card, Stat } from "@/components/ui";
import { catalog, spiceAudit } from "@/lib/analysis";

export default function AdminHome() {
  const audit = spiceAudit();
  const review = audit.filter((a) => a.verdict === "raise" || a.verdict === "lower").length;
  const all = catalog();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">관리자</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="전체 문제" value={all.length} sub={`LeetCode ${all.filter((p) => p.platform === "leetcode").length} · 프로그래머스 ${all.filter((p) => p.platform === "programmers").length}`} />
        <Stat label="맵기 조정 검토 필요" value={review} sub="체감 투표 기준" />
        <Stat label="총 투표" value={audit.reduce((a, r) => a + r.votes, 0)} sub="가상 데이터" />
        <Stat label="표본 부족 문제" value={audit.filter((a) => a.verdict === "insufficient").length} />
      </div>

      <Card title="관리 메뉴">
        <ul className="divide-y divide-gray-100 text-sm">
          <li className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium">난이도(맵기) 관리</div>
              <div className="text-xs text-gray-500">푼 사람들의 체감 투표로 문제별 맵기가 적절한지 확인합니다.</div>
            </div>
            <Link href="/admin/difficulty" className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
              열기
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}
