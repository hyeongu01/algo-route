"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfile } from "@/lib/onboarding";

const input = "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (name.length < 2 || name.length > 16) return setError("닉네임은 2~16자로 입력해주세요.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("이메일 형식이 올바르지 않아요.");
    if (form.password.length < 8) return setError("비밀번호는 8자 이상이어야 해요.");
    if (form.password !== form.confirm) return setError("비밀번호가 서로 달라요.");
    saveProfile({ name, email, at: new Date().toISOString() });
    router.push("/onboarding");
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="mt-1 text-sm text-gray-500">가입하면 내 실력에 맞는 맵기부터 시작할 수 있어요.</p>
      </div>
      <label className="block text-sm font-medium">
        닉네임
        <input value={form.name} onChange={set("name")} autoComplete="nickname" className={input} />
      </label>
      <label className="block text-sm font-medium">
        이메일
        <input type="email" value={form.email} onChange={set("email")} autoComplete="email" className={input} />
      </label>
      <label className="block text-sm font-medium">
        비밀번호
        <input type="password" value={form.password} onChange={set("password")} autoComplete="new-password" className={input} />
      </label>
      <label className="block text-sm font-medium">
        비밀번호 확인
        <input type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" className={input} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">가입하고 시작하기</button>
      <p className="text-sm text-gray-500">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-medium text-indigo-600 underline">
          로그인
        </Link>
      </p>
      <p className="text-xs text-gray-400">
        목업이라 계정은 이 브라우저에만 저장되고, 비밀번호는 저장하지 않아요.{" "}
        <Link href="/recommend" className="underline">
          둘러보기
        </Link>
      </p>
    </form>
  );
}
