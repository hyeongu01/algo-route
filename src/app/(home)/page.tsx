import Link from "next/link";
import HomeCta from "@/components/HomeCta";
import HomeHeader from "@/components/HomeHeader";
import { seedAnswers, seedQuestions } from "@/data/board";
import { getProblem } from "@/lib/analysis";
import { FADE_SOLVES } from "@/lib/initial-spice";
import { MODES } from "@/lib/recommend";
import { problemHref } from "@/lib/slug";
import { SPICE_LEVELS } from "@/lib/spice";

const STEPS = [
  { icon: "📝", title: "시작 맵기 정하기", body: "가입하고 문제 몇 개에 '쉬워요 / 쉽지 않아요'만 답하면 지금 내 맵기가 정해져요." },
  { icon: "🎯", title: "맞춤 추천 받기", body: "내 맵기에 맞는 문제를 복습, 약점 보강, 새로운 개념 등 원하는 방식으로 골라 받아요." },
  { icon: "⌨️", title: "풀고 기록하기", body: "풀이 화면에서 코드와 메모, 걸린 시간을 남기면 성공률과 속도가 분석돼요." },
  { icon: "📈", title: "맵기가 자라요", body: `풀수록 실제 기록이 맵기에 반영돼요. ${FADE_SOLVES}문제를 풀면 시작 맵기는 더 이상 영향을 주지 않아요.` },
];

export const metadata = { title: "algo-route · 라면 맵기로 고르는 알고리즘 문제" };

/** 홈 미리보기용 최근 질문. 스포일러 방지를 위해 제목과 답변 수만 쓴다(본문/답변은 문제 풀이 후 Q&A에서). */
function recentQuestions(n = 4) {
  return [...seedQuestions]
    .sort((a, b) => b.at.localeCompare(a.at))
    .flatMap((q) => {
      const problem = getProblem(q.problemId);
      if (!problem) return [];
      return [{ q, problem, answers: seedAnswers.filter((a) => a.questionId === q.id).length }];
    })
    .slice(0, n);
}

export default function Home() {
  const questions = recentQuestions();
  return (
    <>
      <HomeHeader />
      <main>
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:pt-24">
          <div className="text-5xl">🍜🌶</div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
            오늘, 내 맵기에 딱 맞는
            <br />
            알고리즘 문제
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            난이도를 라면 맵기로 나누고, 내 풀이 기록으로 다음에 풀 문제를 추천해요. LeetCode와 프로그래머스 문제를 한곳에서 이어서 풀어보세요.
          </p>
          <HomeCta className="mt-8 justify-center" />
        </section>

        <section id="how" className="scroll-mt-16 border-t border-gray-200 bg-white py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-bold">이렇게 사용해요</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <div key={s.title} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-xs font-semibold text-gray-400">STEP {i + 1}</span>
                  </div>
                  <h3 className="mt-2 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="spice" className="scroll-mt-16 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-bold">맵기 가이드</h2>
            <p className="mt-2 text-sm text-gray-500">문제 난이도는 1(순한맛)부터 5(극강 매운맛)까지 라면 맵기로 표시해요. 푼 사람들의 체감 투표로 계속 조정돼요.</p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-5">
              {SPICE_LEVELS.map((l) => (
                <li key={l.level} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                  <div className="text-sm tracking-tighter">{"🌶".repeat(l.level)}</div>
                  <div className="mt-2 font-semibold">{l.name}</div>
                  <div className="text-xs text-gray-500">{l.ramen}</div>
                  <div className="mx-auto mt-3 h-1.5 w-10 rounded-full" style={{ background: l.fill }} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="modes" className="scroll-mt-16 border-t border-gray-200 bg-white py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-bold">골라 쓰는 추천 방식</h2>
            <p className="mt-2 text-sm text-gray-500">오늘 기분에 맞게 방식을 고르세요. 모든 추천에는 &lsquo;왜 이 문제인지&rsquo; 이유가 함께 표시돼요.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MODES.map((m) => (
                <div key={m.v} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{m.icon}</span>
                    <span className="font-semibold">{m.label}</span>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium ${m.chip}`}>{m.short}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{m.how}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="community" className="scroll-mt-16 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-bold">커뮤니티 · 질문 &amp; 답변</h2>
            <p className="mt-2 text-sm text-gray-500">
              막힌 문제는 문제별 Q&amp;A에서 물어보고 답해요. 풀기 전에 정답이 보이지 않도록, 문제를 풀기 시작하면 해당 문제의 Q&amp;A가 열려요.
            </p>
            <ul className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {questions.map(({ q, problem, answers }) => (
                <li key={q.id}>
                  <Link href={`${problemHref(problem.id)}/qna`} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{q.title}</div>
                      <div className="mt-0.5 truncate text-xs text-gray-500">
                        {problem.title} · {q.author} · {q.at.slice(0, 10)}
                      </div>
                    </div>
                    {q.accepted && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">채택됨</span>}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${answers ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>답변 {answers}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="text-2xl font-bold">지금 내 맵기부터 알아볼까요?</h2>
            <p className="mt-2 text-sm text-gray-500">1분이면 충분해요. 둘러보기만 해도 괜찮아요.</p>
            <HomeCta className="mt-6 justify-center" />
            <p className="mt-4 text-sm text-gray-400">
              <Link href="/recommend" className="underline">
                가입 없이 문제 추천 둘러보기
              </Link>
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">algo-route · MOCKUP</footer>
    </>
  );
}
