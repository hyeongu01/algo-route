"use client";

import Link from "next/link";
import ProblemBoard from "@/components/ProblemBoard";
import { Card } from "@/components/ui";
import { useCanUseBoard } from "@/lib/board";
import { problemHref } from "@/lib/slug";
import type { Problem } from "@/lib/types";

export default function QnaPage({ problem }: { problem: Problem }) {
  const allowed = useCanUseBoard(problem);
  if (!allowed) {
    return (
      <Card>
        <div className="py-8 text-center">
          <div className="text-3xl">🔒</div>
          <p className="mt-2 text-sm text-gray-500">질문 &amp; 답변은 이 문제의 풀이 내역이 있어야 볼 수 있어요.</p>
          <Link href={problemHref(problem.id)} className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            문제 풀러 가기
          </Link>
        </div>
      </Card>
    );
  }
  return <ProblemBoard problemId={problem.id} />;
}
