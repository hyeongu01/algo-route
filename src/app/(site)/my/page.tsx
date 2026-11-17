import MySolutions from "@/components/MySolutions";
import { catalog } from "@/lib/analysis";

export default function My() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">내 풀이</h1>
        <p className="mt-1 text-sm text-gray-500">
          푼 문제와 못 푼 문제를 펼쳐서 문제 링크, 메모, 내 풀이, 분석 결과를 다시 볼 수 있어요. 이 앱에서 남긴 기록은 지금은 이 브라우저에만 저장됩니다.
        </p>
      </div>
      <MySolutions catalog={catalog()} />
    </div>
  );
}
