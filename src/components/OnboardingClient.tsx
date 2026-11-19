"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlatformBadge, Tag } from "@/components/ui";
import { estimateSpice, FADE_SOLVES, type ProbeAnswer } from "@/lib/initial-spice";
import { saveOnboarding } from "@/lib/onboarding";
import { spiceInfo } from "@/lib/spice";
import type { Platform, Spice } from "@/lib/types";

export interface Probe {
  id: string;
  title: string;
  platform: Platform;
  tags: string[];
  url: string;
  /** 판단용 — 화면에는 보여주지 않는다(답에 영향을 주지 않도록) */
  spice: Spice;
}

export default function OnboardingClient({ probes }: { probes: Probe[] }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<ProbeAnswer[]>([]);

  if (!probes.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        보여줄 문제가 없어요.{" "}
        <Link href="/recommend" className="text-indigo-600 underline">
          바로 시작하기
        </Link>
      </div>
    );
  }

  if (i >= probes.length) {
    const spice = estimateSpice(answers);
    const level = Math.round(spice) as Spice;
    const info = spiceInfo(level);
    const start = () => {
      saveOnboarding({ spice, answers, at: new Date().toISOString() });
      router.push("/recommend");
    };
    return (
      <div className="rise space-y-5 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <div className="text-sm text-gray-500">당신의 시작 맵기는</div>
        <div className="text-5xl">{"🌶".repeat(level)}</div>
        <div>
          <div className="text-3xl font-bold tabular-nums">{spice.toFixed(1)}</div>
          <div className="mt-1 text-lg font-semibold">
            {info.name} · {info.ramen}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          처음에는 이 맵기에 맞춰 추천해드려요. 문제를 풀수록 실제 풀이 기록이 더 많이 반영되고, {FADE_SOLVES}문제를 풀면 이 설정은 더 이상 영향을 주지 않아요.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setI(0);
              setAnswers([]);
            }}
            className="rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            다시 해보기
          </button>
          <button onClick={start} className="flex-1 rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
            이 맵기로 시작하기 →
          </button>
        </div>
      </div>
    );
  }

  const probe = probes[i];
  const answer = (easy: boolean) => {
    setAnswers((a) => [...a.slice(0, i), { problemId: probe.id, spice: probe.spice, easy }]);
    setI(i + 1);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">내 맵기 알아보기</h1>
        <p className="mt-1 text-sm text-gray-500">문제를 보고 쉬운지 아닌지만 골라주세요. 직접 풀어보지 않아도, 대략 느낌으로 괜찮아요.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(i / probes.length) * 100}%` }} />
        </div>
        <span className="text-xs tabular-nums text-gray-500">
          {i + 1} / {probes.length}
        </span>
      </div>

      <article key={probe.id} className="rise space-y-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <PlatformBadge p={probe.platform} />
        <h2 className="text-xl font-semibold leading-snug">{probe.title}</h2>
        <div className="flex flex-wrap gap-1">
          {probe.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <a href={probe.url} target="_blank" rel="noreferrer" className="inline-block text-sm text-indigo-600 underline">
          문제 보기 ↗
        </a>
      </article>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => answer(true)} className="rounded-xl border border-gray-200 bg-white py-4 text-base font-semibold hover:border-emerald-400 hover:bg-emerald-50">
          😋 쉬워요
        </button>
        <button onClick={() => answer(false)} className="rounded-xl border border-gray-200 bg-white py-4 text-base font-semibold hover:border-red-400 hover:bg-red-50">
          🥵 쉽지 않아요
        </button>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <button onClick={() => setI(i - 1)} disabled={i === 0} className="hover:text-gray-600 disabled:invisible">
          ← 이전
        </button>
        <Link href="/recommend" className="hover:text-gray-600">
          나중에 하기
        </Link>
      </div>
    </div>
  );
}
