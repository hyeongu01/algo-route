import type { Metadata } from "next";
import AdminNav from "@/components/AdminNav";

export const metadata: Metadata = {
  title: "algo-route 관리자",
  robots: { index: false, follow: false },
};

// TODO: 백엔드 연결 시 관리자 인증/권한 검사를 여기(레이아웃)에서 수행
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <AdminNav />
      <main className="w-full px-4 py-6 md:px-8">{children}</main>
    </>
  );
}
