"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, useProfile } from "@/lib/onboarding";

const ghost = "rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100";
const solid = "rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700";

/** 홈 상단: 로그인 전엔 로그인/회원가입, 로그인 후엔 서비스로 들어가는 버튼 */
export default function HomeHeader() {
  const profile = useProfile();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          algo-route
        </Link>
        <nav className="ml-4 hidden gap-1 text-sm text-gray-600 sm:flex">
          <a href="#how" className="rounded-md px-3 py-1.5 hover:bg-gray-100">
            이용 방법
          </a>
          <a href="#spice" className="rounded-md px-3 py-1.5 hover:bg-gray-100">
            맵기 가이드
          </a>
          <a href="#modes" className="rounded-md px-3 py-1.5 hover:bg-gray-100">
            추천 방식
          </a>
          <a href="#community" className="rounded-md px-3 py-1.5 hover:bg-gray-100">
            커뮤니티
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {profile ? (
            <>
              <span className="hidden text-sm text-gray-500 sm:inline">{profile.name}님</span>
              <button
                onClick={() => {
                  logout();
                  router.refresh();
                }}
                className={ghost}
              >
                로그아웃
              </button>
              <Link href="/recommend" className={solid}>
                문제 추천 받기
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={ghost}>
                로그인
              </Link>
              <Link href="/signup" className={solid}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
