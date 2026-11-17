"use client";

import { useSyncExternalStore } from "react";
import { seedAnswers, seedQuestions } from "@/data/board";
import { useAttempts } from "./records";
import type { BoardAnswer, BoardQuestion, Problem } from "./types";

/** 현재 사용자. 로그인 연동 전까지 고정값. */
export const ME = "hyeonwoo";

/** 내가 쓴 글의 id는 "u-"로 시작한다 (데모 글과 구분, 삭제 권한 판단용). */
export const isMine = (id: string) => id.startsWith("u-");
export const newId = () => `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

interface State {
  questions: BoardQuestion[]; // 내가 쓴 질문
  answers: BoardAnswer[]; // 내가 쓴 답변 (데모 질문에 단 것 포함)
  accepted: Record<string, string>; // 내 질문의 채택 답변 questionId -> answerId
}

const KEY = "algo-route:board:v1";
const EVT = "algo-route:board";
const EMPTY: State = { questions: [], answers: [], accepted: {} };

let cacheRaw: string | null = null;
let cache: State = EMPTY;

function read(): State {
  try {
    const raw = localStorage.getItem(KEY) ?? "";
    if (raw !== cacheRaw) {
      cacheRaw = raw;
      cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    }
  } catch {
    // 저장소 접근 불가/손상: 마지막 정상 캐시 유지
  }
  return cache;
}

function write(next: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(EVT));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVT, cb);
  };
}

export interface BoardThread {
  question: BoardQuestion;
  answers: BoardAnswer[];
  acceptedId: string | null;
}

let threadsKey: State | null = null;
let threadsCache: Record<string, BoardThread[]> = {};

/** 문제별 질문 목록(최신순). 각 질문의 답변은 채택 우선, 그다음 오래된 순. */
function build(s: State): Record<string, BoardThread[]> {
  const all = [...seedQuestions, ...s.questions];
  const byProblem: Record<string, BoardThread[]> = {};
  for (const question of all) {
    const answers = [...seedAnswers, ...s.answers].filter((a) => a.questionId === question.id);
    const acceptedId = s.accepted[question.id] ?? question.accepted ?? null;
    answers.sort((a, b) => Number(b.id === acceptedId) - Number(a.id === acceptedId) || a.at.localeCompare(b.at));
    (byProblem[question.problemId] ??= []).push({ question, answers, acceptedId: answers.some((a) => a.id === acceptedId) ? acceptedId : null });
  }
  for (const list of Object.values(byProblem)) list.sort((a, b) => b.question.at.localeCompare(a.question.at));
  return byProblem;
}

const NONE: BoardThread[] = [];

export function useThreads(problemId: string): BoardThread[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      const s = read();
      if (threadsKey !== s) {
        threadsKey = s;
        threadsCache = build(s);
      }
      return threadsCache[problemId] ?? NONE;
    },
    () => NONE,
  );
}

export function addQuestion(q: Omit<BoardQuestion, "id" | "at" | "author">) {
  const s = read();
  write({ ...s, questions: [...s.questions, { ...q, id: newId(), at: new Date().toISOString(), author: ME }] });
}

export function addAnswer(a: Omit<BoardAnswer, "id" | "at" | "author">) {
  const s = read();
  write({ ...s, answers: [...s.answers, { ...a, id: newId(), at: new Date().toISOString(), author: ME }] });
}

export function deleteQuestion(id: string) {
  const s = read();
  const accepted = Object.fromEntries(Object.entries(s.accepted).filter(([qid]) => qid !== id));
  write({ questions: s.questions.filter((q) => q.id !== id), answers: s.answers.filter((a) => a.questionId !== id), accepted });
}

export function deleteAnswer(id: string) {
  const s = read();
  const accepted = Object.fromEntries(Object.entries(s.accepted).filter(([, aid]) => aid !== id));
  write({ ...s, answers: s.answers.filter((a) => a.id !== id), accepted });
}

/** 내 질문에서만 호출. answerId가 null이면 채택 취소. */
export function setAccepted(questionId: string, answerId: string | null) {
  const s = read();
  const accepted = { ...s.accepted };
  if (answerId) accepted[questionId] = answerId;
  else delete accepted[questionId];
  write({ ...s, accepted });
}

/** 질문 & 답변은 풀이 내역(이 앱에서의 시도, 또는 이미 푼 문제)이 있을 때만 이용할 수 있다. 풀기 전에 정답이 노출되는 걸 막기 위함. */
export function useCanUseBoard(problem: Problem): boolean {
  const attempts = useAttempts(problem.id);
  return attempts.length > 0 || problem.status === "solved";
}
