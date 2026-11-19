import Link from "next/link";

/** 가입·온보딩처럼 한 가지에 집중하는 화면용 레이아웃 (메뉴 없음) */
export default function FlowLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-8">
      <Link href="/" className="mb-8 text-lg font-bold text-indigo-600">
        algo-route
      </Link>
      {children}
    </main>
  );
}
