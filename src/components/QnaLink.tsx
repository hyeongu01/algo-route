"use client";

import Link from "next/link";
import { useCanUseBoard, useThreads } from "@/lib/board";
import { problemHref } from "@/lib/slug";
import type { Problem } from "@/lib/types";

/** 왼쪽 사이드바 항목: 누르면 질문 & 답변 페이지로 이동. 풀이 내역이 없으면 잠김. */
export default function QnaLink({ problem }: { problem: Problem }) {
  const allowed = useCanUseBoard(problem);
  const count = useThreads(problem.id).length;
  const box = "rounded-xl border border-gray-200 bg-white p-4 shadow-sm";

  if (!allowed) {
    return (
      <div className={`${box} opacity-70`} title="풀이 내역이 있어야 이용할 수 있어요">
        <h2 className="text-sm font-semibold text-gray-500">🔒 질문 &amp; 답변</h2>
        <p className="mt-1 text-xs leading-relaxed text-gray-400">풀이를 시작하면 열려요. 풀기 전에 정답이 보이는 걸 막기 위해서예요.</p>
      </div>
    );
  }
  return (
    <Link href={`${problemHref(problem.id)}/qna`} className={`${box} flex items-center gap-2 hover:border-indigo-300`}>
      <span className="text-sm font-semibold text-gray-500">💬 질문 &amp; 답변</span>
      <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${count ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>{count}</span>
      <span className="text-gray-400">→</span>
    </Link>
  );
}
