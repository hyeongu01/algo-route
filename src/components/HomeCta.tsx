"use client";

import Link from "next/link";
import { useProfile } from "@/lib/onboarding";

/** 홈의 큰 행동 버튼. 로그인 상태에 따라 목적지가 바뀐다. */
export default function HomeCta({ className = "" }: { className?: string }) {
  const profile = useProfile();
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {profile ? (
        <Link href="/recommend" className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700">
          오늘의 문제 추천 받기 →
        </Link>
      ) : (
        <>
          <Link href="/signup" className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700">
            무료로 시작하기 →
          </Link>
          <Link href="/login" className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50">
            로그인
          </Link>
        </>
      )}
    </div>
  );
}
