import { redirect } from "next/navigation";

// 서비스의 기본 페이지는 문제 추천. (전체 문제로 바꾸려면 아래 경로만 "/problems"로)
export default function Home() {
  redirect("/recommend");
}
