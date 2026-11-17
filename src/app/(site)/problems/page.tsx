import ProblemExplorer from "@/components/ProblemExplorer";
import { catalog } from "@/lib/analysis";

export default function Problems() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">전체 문제</h1>
        <p className="mt-1 text-sm text-gray-500">
          난이도는 각 플랫폼 기준이 아니라 algo-route 자체 &lsquo;라면 맵기&rsquo;(1 순한맛 ~ 5 극강 매운맛)입니다.
        </p>
      </div>
      <ProblemExplorer problems={catalog()} />
    </div>
  );
}
