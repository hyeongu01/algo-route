"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { addAnswer, addQuestion, deleteAnswer, deleteQuestion, isMine, ME, setAccepted, useThreads } from "@/lib/board";

const fmt = (iso: string) => iso.slice(0, 10);

/** 풀이 스포일러가 있는 글은 눌러서 볼 때까지 가린다. */
function Body({ text, spoiler }: { text: string; spoiler: boolean }) {
  const [shown, setShown] = useState(false);
  if (spoiler && !shown) {
    return (
      <button onClick={() => setShown(true)} className="w-full rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-left text-xs text-amber-700 hover:bg-amber-100">
        ⚠️ 풀이 내용이 포함된 글이에요. 직접 풀어본 뒤에 보는 걸 추천해요. (눌러서 보기)
      </button>
    );
  }
  return <p className="whitespace-pre-wrap text-sm text-gray-700">{text}</p>;
}

function Composer({ placeholder, submit, rows = 3, titled = false }: { placeholder: string; submit: (v: { title: string; body: string; spoiler: boolean }) => void; rows?: number; titled?: boolean }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const ready = body.trim() && (!titled || title.trim());

  return (
    <div className="space-y-2">
      {titled && (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="질문 제목"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
        />
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y rounded-md border border-gray-300 p-3 text-sm focus:border-indigo-400 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs text-gray-500">
          <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} />
          풀이 내용(스포일러)이 포함돼 있어요
        </label>
        <button
          disabled={!ready}
          onClick={() => {
            submit({ title: title.trim(), body: body.trim(), spoiler });
            setTitle("");
            setBody("");
            setSpoiler(false);
          }}
          className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          등록
        </button>
      </div>
    </div>
  );
}

export default function ProblemBoard({ problemId }: { problemId: string }) {
  const threads = useThreads(problemId);
  const [asking, setAsking] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-500">질문 &amp; 답변 {threads.length > 0 && `(${threads.length})`}</h2>
        <button onClick={() => setAsking((a) => !a)} className="ml-auto rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
          {asking ? "닫기" : "✏️ 질문하기"}
        </button>
      </div>

      {asking && (
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <Composer
            titled
            rows={4}
            placeholder="막힌 부분이나 궁금한 점을 적어주세요. 풀이 코드를 붙여도 좋아요."
            submit={({ title, body, spoiler }) => {
              addQuestion({ problemId, title, body, spoiler });
              setAsking(false);
            }}
          />
        </div>
      )}

      {threads.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">아직 질문이 없어요. 첫 질문을 남겨보세요!</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {threads.map(({ question: q, answers, acceptedId }) => {
            const isOpen = open === q.id;
            return (
              <li key={q.id}>
                <button onClick={() => setOpen(isOpen ? null : q.id)} aria-expanded={isOpen} className="flex w-full flex-wrap items-center gap-2 py-3 text-left">
                  <span className={`text-xs text-gray-400 transition ${isOpen ? "rotate-90" : ""}`}>▸</span>
                  <span className="font-medium">{q.title}</span>
                  {acceptedId && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">✓ 해결됨</span>}
                  <span className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                    <span>
                      {q.author} · {fmt(q.at)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 ${answers.length ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>답변 {answers.length}</span>
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-4 pb-4 pl-5">
                    <div className="space-y-2">
                      <Body text={q.body} spoiler={q.spoiler} />
                      {isMine(q.id) && (
                        <button
                          onClick={() => {
                            if (window.confirm("이 질문과 달린 답변을 모두 삭제할까요?")) deleteQuestion(q.id);
                          }}
                          className="text-xs text-gray-400 hover:text-rose-600"
                        >
                          질문 삭제
                        </button>
                      )}
                    </div>

                    {answers.length > 0 && (
                      <ul className="space-y-2">
                        {answers.map((a) => {
                          const best = a.id === acceptedId;
                          return (
                            <li key={a.id} className={`rounded-lg border p-3 ${best ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white"}`}>
                              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <b className="text-gray-700">{a.author}</b>
                                <span>{fmt(a.at)}</span>
                                {best && <span className="rounded bg-emerald-600 px-1.5 py-0.5 font-medium text-white">채택된 답변</span>}
                                <span className="ml-auto flex gap-2">
                                  {isMine(q.id) && (
                                    <button onClick={() => setAccepted(q.id, best ? null : a.id)} className="hover:text-emerald-700">
                                      {best ? "채택 취소" : "채택"}
                                    </button>
                                  )}
                                  {isMine(a.id) && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm("이 답변을 삭제할까요?")) deleteAnswer(a.id);
                                      }}
                                      className="hover:text-rose-600"
                                    >
                                      삭제
                                    </button>
                                  )}
                                </span>
                              </div>
                              <Body text={a.body} spoiler={a.spoiler} />
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 text-xs text-gray-500">{ME}(으)로 답변하기</div>
                      <Composer rows={3} placeholder="답변을 입력하세요." submit={({ body, spoiler }) => addAnswer({ questionId: q.id, body, spoiler })} />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
