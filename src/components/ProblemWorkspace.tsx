"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AnalysisView from "@/components/AnalysisView";
import { Card, PlatformBadge, SpiceBadge, Tag } from "@/components/ui";
import MemoEditor from "@/components/MemoEditor";
import { EDITOR_SIZES, useDefaultLang, useEditorSize } from "@/lib/prefs";
import { saveRecord } from "@/lib/records";
import { problemHref } from "@/lib/slug";
import { analyze, fmtTime, LANGS, type Analysis, type Lang } from "@/lib/solution";
import type { Problem } from "@/lib/types";

/** 시작 시각(ms)으로부터 경과한 초. 이벤트 핸들러/타이머에서만 호출한다. */
const since = (t: number) => Math.floor((Date.now() - t) / 1000);

type Phase = "idle" | "solving" | "done" | "gaveup";

const BLOCKERS = ["문제 이해", "접근법이 안 떠오름", "구현", "시간 초과/효율", "엣지 케이스"];

const VOTES = [
  { v: "easier", label: "덜 매워요" },
  { v: "fit", label: "딱 좋아요" },
  { v: "harder", label: "더 매워요" },
] as const;

function CodePanel({
  lang,
  onLang,
  value,
  onChange,
  sizePx,
  readOnly = false,
  className = "",
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  value: string;
  onChange: (v: string) => void;
  sizePx: number;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500">풀이 (코드 붙여넣기)</h2>
        <select
          value={lang}
          onChange={(e) => onLang(e.target.value as Lang)}
          disabled={readOnly}
          aria-label="사용 언어"
          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:bg-gray-50"
        >
          {LANGS.map((l) => (
            <option key={l.v} value={l.v}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        placeholder="완성한 코드를 여기에 붙여넣으세요."
        style={{ fontSize: sizePx }}
        className="min-h-0 w-full flex-1 resize-none rounded-md border border-gray-200 bg-gray-50 p-4 font-mono leading-relaxed focus:border-indigo-400 focus:outline-none"
      />
    </div>
  );
}

export default function ProblemWorkspace({ problem, related }: { problem: Problem; related: Problem[] }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [memo, setMemo] = useState("");
  const [result, setResult] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [vote, setVote] = useState<string | null>(null);
  const defaultLang = useDefaultLang();
  const [chosenLang, setLang] = useState<Lang | null>(null);
  const lang = chosenLang ?? defaultLang;
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [blocker, setBlocker] = useState<string | null>(null);
  const failedAt = useRef("");
  const startedAt = useRef(0);
  const base = useRef(0);
  const sizeId = useEditorSize();
  const size = EDITOR_SIZES.find((x) => x.id === sizeId)!;

  useEffect(() => {
    if (phase !== "solving" || paused) return;
    startedAt.current = Date.now();
    const t = setInterval(() => setSeconds(base.current + since(startedAt.current)), 1000);
    return () => {
      clearInterval(t);
      base.current += since(startedAt.current);
    };
  }, [phase, paused]);

  // 풀이 중 새로고침/이탈 시 작성한 내용이 사라지므로 경고 (임시 저장은 백엔드 연결 후)
  useEffect(() => {
    if (phase !== "solving") return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [phase]);

  useEffect(() => {
    if (phase !== "solving") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const start = () => {
    base.current = 0;
    setSeconds(0);
    setPaused(false);
    setPhase("solving");
  };
  const finish = () => {
    const total = base.current + (paused ? 0 : since(startedAt.current));
    setSeconds(total);
    const a = analyze(result, total, problem.spice, problem.tags, lang);
    setAnalysis(a);
    saveRecord({ problemId: problem.id, status: "solved", lang, memo, code: result, seconds: total, at: new Date().toISOString(), analysis: a });
    setPhase("done");
  };
  // 포기한 시도는 같은 at으로 갱신해서(막힌 지점 추가) 내역이 중복되지 않게 한다.
  const persistFailed = (total: number, b?: string) => {
    saveRecord({ problemId: problem.id, status: "failed", lang, memo, code: result, seconds: total, at: failedAt.current, analysis: null, blocker: b });
  };
  const giveUp = () => {
    const total = base.current + (paused ? 0 : since(startedAt.current));
    setSeconds(total);
    failedAt.current = new Date().toISOString();
    persistFailed(total);
    setConfirmQuit(false);
    setPhase("gaveup");
  };

  // 풀이 중에는 다른 화면을 모두 가리고 메모장과 풀이장만 크게 보여준다.
  if (phase === "solving") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-200 bg-white px-4 py-2">
          <span className="max-w-[40vw] truncate text-sm font-semibold">{problem.title}</span>
          <SpiceBadge s={problem.spice} />
          <div className="flex items-center gap-1.5 rounded-md bg-slate-900 px-2 py-1 font-mono text-xs text-white">
            <span>⏱ {fmtTime(seconds)}</span>
            <button onClick={() => setPaused((p) => !p)} className="text-slate-300 hover:text-white" aria-label={paused ? "타이머 재개" : "타이머 일시정지"}>
              {paused ? "▶" : "⏸"}
            </button>
          </div>
          {problem.url && (
            <a href={problem.url} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-indigo-600">
              문제 링크 ↗
            </a>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {!result.trim() && <span className="text-xs text-gray-400">풀이를 입력하면 &lsquo;다 풀었어요&rsquo;가 켜져요</span>}
            {confirmQuit ? (
              <span className="flex items-center gap-2 text-sm text-gray-600">
                포기하고 &lsquo;못 푼 문제&rsquo;로 기록할까요?
                <button onClick={giveUp} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700">
                  네, 기록할게요
                </button>
                <button onClick={() => setConfirmQuit(false)} className="rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200">
                  계속 풀기
                </button>
              </span>
            ) : (
              <button onClick={() => setConfirmQuit(true)} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
                못 풀겠어요
              </button>
            )}
            <button
              onClick={finish}
              disabled={!result.trim()}
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              다 풀었어요
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-2 gap-3 p-3 md:grid-cols-2 md:grid-rows-1">
          <section className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <MemoEditor value={memo} onChange={setMemo} sizePx={size.memoPx} className="flex-1" />
          </section>
          <section className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <CodePanel lang={lang} onLang={setLang} value={result} onChange={setResult} sizePx={size.codePx} className="flex-1" />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge p={problem.platform} />
            <SpiceBadge s={problem.spice} />
          </div>
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <div className="flex flex-wrap gap-1">
            {problem.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {problem.url && (
              <a
                href={problem.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                문제 링크 열기 ↗
              </a>
            )}
            {phase === "idle" && (
              <button onClick={start} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                풀이 시작
              </button>
            )}
          </div>
        </div>
      </div>

      {phase === "idle" && (
        <Card>
          <p className="text-sm text-gray-500">
            문제 링크에서 문제를 확인한 뒤 <b>풀이 시작</b>을 누르면 타이머가 켜지고, 화면이 메모장과 풀이장만 크게 보이는 집중 모드로 바뀝니다.
            권장 풀이 시간은 이 맵기 기준 약 {analyze("", 0, problem.spice, []).expectedMin}분입니다.
          </p>
        </Card>
      )}

      {phase !== "idle" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <MemoEditor value={memo} onChange={setMemo} sizePx={size.memoPx} readOnly className="h-[28rem]" />
          </Card>
          <Card>
            <CodePanel lang={lang} onLang={setLang} value={result} onChange={setResult} sizePx={size.codePx} readOnly className="h-[28rem]" />
          </Card>
        </div>
      )}

      {phase === "done" && analysis && (
        <Card title="풀이 분석">
          <AnalysisView analysis={analysis} />

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
            이 문제, 얼마나 매웠나요? (<SpiceBadge s={problem.spice} /> 기준)
            {VOTES.map((o) => (
              <button
                key={o.v}
                onClick={() => setVote(o.v)}
                className={`rounded px-3 py-1 text-xs ${vote === o.v ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {o.label}
              </button>
            ))}
            {vote && <span className="text-xs text-emerald-600">의견이 기록되었어요 (목업)</span>}
          </div>
        </Card>
      )}
      {phase === "gaveup" && (
        <Card title="못 풀었어요 — 괜찮아요, 기록해둘게요">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">투자한 시간</div>
                <div className="text-2xl font-bold">{fmtTime(seconds)}</div>
                <div className="mt-1 text-xs text-gray-400">이 문제는 &lsquo;못 푼 문제&rsquo;로 분류됩니다 . 메모와 작성하던 코드와 함께 &lsquo;내 풀이&rsquo;에 저장돼요 (지금은 이 브라우저에만). 시도마다 내역에 쌓여요.</div>
              </div>
              <div>
                <div className="mb-1 text-sm text-gray-600">어디서 막혔나요?</div>
                <div className="flex flex-wrap gap-1.5">
                  {BLOCKERS.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setBlocker(b);
                        persistFailed(seconds, b);
                      }}
                      className={`rounded-full px-3 py-1 text-xs ${blocker === b ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                {blocker && <div className="mt-1 text-xs text-emerald-600">&lsquo;{blocker}&rsquo; 기록됨 — 이후 추천에 반영됩니다 (목업)</div>}
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm text-gray-600">먼저 워밍업해볼 만한 문제</div>
              {related.length ? (
                <ul className="space-y-2">
                  {related.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <SpiceBadge s={r.spice} />
                      <Link href={problemHref(r.id)} className="font-medium hover:text-indigo-600 hover:underline">
                        {r.title}
                      </Link>
                      <span className="text-xs text-gray-400">{r.tags.filter((t) => problem.tags.includes(t)).join(", ")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">비슷한 키워드의 더 순한 문제가 아직 없어요.</p>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
            이 문제, 얼마나 매운 것 같나요? (<SpiceBadge s={problem.spice} /> 기준)
            {VOTES.map((o) => (
              <button
                key={o.v}
                onClick={() => setVote(o.v)}
                className={`rounded px-3 py-1 text-xs ${vote === o.v ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {o.label}
              </button>
            ))}
            {vote && <span className="text-xs text-emerald-600">의견이 기록되었어요 (목업)</span>}
          </div>
        </Card>
      )}
    </div>
  );
}
