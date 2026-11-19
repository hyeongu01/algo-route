"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfile } from "@/lib/onboarding";

const input = "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

/** 목업 로그인: 서버가 없어 계정을 검증하지 않는다. 입력한 이메일로 이 브라우저의 로그인 상태만 만든다. */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const mail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(mail)) return setError("이메일 형식이 올바르지 않아요.");
    if (!password) return setError("비밀번호를 입력해주세요.");
    saveProfile({ name: mail.split("@")[0].slice(0, 16), email: mail, at: new Date().toISOString() });
    router.push("/");
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="mt-1 text-sm text-gray-500">다시 만나서 반가워요.</p>
      </div>
      <label className="block text-sm font-medium">
        이메일
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} />
      </label>
      <label className="block text-sm font-medium">
        비밀번호
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={input} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">로그인</button>
      <p className="text-sm text-gray-500">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="font-medium text-indigo-600 underline">
          회원가입
        </Link>
      </p>
      <p className="text-xs text-gray-400">목업이라 계정을 확인하지 않아요. 입력한 이메일로 이 브라우저에서만 로그인됩니다.</p>
    </form>
  );
}
