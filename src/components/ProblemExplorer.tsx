"use client";

import Link from "next/link";
import { useRecords } from "@/lib/records";
import { problemHref } from "@/lib/slug";
import { useMemo, useState } from "react";
import { Card, PlatformBadge, SpiceBadge, Tag } from "@/components/ui";
import { SPICE_LEVELS } from "@/lib/spice";
import type { Platform, Problem, Status } from "@/lib/types";

const STATUS: Record<Status, { label: string; chip: string }> = {
  solved: { label: "푼 문제", chip: "bg-emerald-100 text-emerald-700" },
  failed: { label: "못 푼 문제", chip: "bg-rose-100 text-rose-700" },
  unsolved: { label: "안 푼 문제", chip: "bg-gray-100 text-gray-600" },
};
type Sort = "spice-desc" | "spice-asc" | "title";

function Pills<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-md px-3 py-1 text-sm ${value === o.v ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// 체감 난이도 투표 (목업: 브라우저 상태에만 저장)
const VOTES = [
  { v: "easier", label: "덜 매워요" },
  { v: "fit", label: "딱 좋아요" },
  { v: "harder", label: "더 매워요" },
] as const;

export default function ProblemExplorer({ problems: base }: { problems: Problem[] }) {
  const records = useRecords();
  // 이 앱에서 푼/포기한 기록이 있으면 상태에 반영
  const problems = useMemo(() => base.map((p) => (records[p.id] ? { ...p, status: records[p.id].status } : p)), [base, records]);
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [sort, setSort] = useState<Sort>("spice-asc");
  const [tags, setTags] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [votes, setVotes] = useState<Record<string, string>>({});

  const allTags = useMemo(() => [...new Set(problems.flatMap((p) => p.tags))].sort(), [problems]);
  const counts = useMemo(() => {
    const c = { solved: 0, failed: 0, unsolved: 0 } as Record<Status, number>;
    problems.forEach((p) => c[p.status]++);
    return c;
  }, [problems]);

  const rows = useMemo(() => {
    const list = problems.filter(
      (p) =>
        (platform === "all" || p.platform === platform) &&
        (status === "all" || p.status === status) &&
        tags.every((t) => p.tags.includes(t)) &&
        p.title.toLowerCase().includes(q.trim().toLowerCase()),
    );
    return list.sort((a, b) =>
      sort === "title" ? a.title.localeCompare(b.title) : (sort === "spice-asc" ? a.spice - b.spice : b.spice - a.spice) || a.title.localeCompare(b.title),
    );
  }, [problems, platform, status, tags, sort, q]);

  const toggleTag = (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Pills
              value={platform}
              onChange={setPlatform}
              options={[{ v: "all", label: "전체 플랫폼" }, { v: "leetcode", label: "LeetCode" }, { v: "programmers", label: "프로그래머스" }]}
            />
            <Pills
              value={status}
              onChange={setStatus}
              options={[
                { v: "all", label: `전체 ${problems.length}` },
                { v: "solved", label: `푼 ${counts.solved}` },
                { v: "failed", label: `못 푼 ${counts.failed}` },
                { v: "unsolved", label: `안 푼 ${counts.unsolved}` },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="제목 검색"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-gray-500">
              정렬
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-800">
                <option value="spice-asc">맵기 낮은 순 (순한맛 → 매운맛)</option>
                <option value="spice-desc">맵기 높은 순 (매운맛 → 순한맛)</option>
                <option value="title">제목 순</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`rounded-full px-2.5 py-0.5 text-xs ${tags.includes(t) ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
              >
                {t}
              </button>
            ))}
            {tags.length > 0 && (
              <button onClick={() => setTags([])} className="px-2 text-xs text-gray-400 hover:text-gray-600">
                키워드 초기화
              </button>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span>{rows.length}개 표시</span>
        {SPICE_LEVELS.map((l) => (
          <span key={l.level}>
            🌶{l.level} {l.name}({l.ramen})
          </span>
        ))}
      </div>

      <Card className="!p-0">
        <ul className="divide-y divide-gray-100">
          {rows.map((p) => (
            <li key={p.id} className="space-y-2 px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <PlatformBadge p={p.platform} />
                <SpiceBadge s={p.spice} />
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS[p.status].chip}`}>
                  {STATUS[p.status].label}
                  {p.attempts > 1 ? ` · ${p.attempts}회` : ""}
                </span>
                <Link href={problemHref(p.id)} className="font-medium hover:text-indigo-600 hover:underline">
                  {p.title}
                </Link>
                {p.lastDate && <span className="ml-auto text-xs text-gray-400">{p.lastDate}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {p.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
                {p.status === "solved" && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                    이 문제, 얼마나 매웠나요?
                    {VOTES.map((o) => (
                      <button
                        key={o.v}
                        onClick={() => setVotes((cur) => ({ ...cur, [p.id]: o.v }))}
                        className={`rounded px-2 py-0.5 ${votes[p.id] === o.v ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </span>
                )}
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="px-5 py-10 text-center text-sm text-gray-400">조건에 맞는 문제가 없습니다.</li>}
        </ul>
      </Card>
    </div>
  );
}
