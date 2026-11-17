export type Platform = "leetcode" | "programmers";
/** 서비스 독자 난이도: 라면 맵기 1(순한맛) ~ 5(가장 매움). 관리자가 추후 조정. */
export type Spice = 1 | 2 | 3 | 4 | 5;
export type Status = "solved" | "failed" | "unsolved";

export interface Problem {
  id: string;
  platform: Platform;
  title: string;
  url: string | null;
  tags: string[];
  spice: Spice;
  status: Status;
  attempts: number;
  firstDate: string;
  lastDate: string;
}

export interface Candidate {
  id: string;
  platform: Platform;
  title: string;
  url: string;
  tags: string[];
  spice: Spice;
}

/** 추천 1건: 대상 문제와 그 이유 */
export interface Recommendation {
  problem: Problem;
  reason: string;
}

export interface RankUser {
  name: string;
  solved: number;
  score: number;
  weekly: number;
  streak: number;
  platforms: Platform[];
  me?: boolean;
}

/** 푼 사람들의 체감 난이도 투표 (현재 맵기 등급 대비). */
export interface SpiceFeedback {
  easier: number; // 덜 매워요
  fit: number; // 딱 맞아요
  harder: number; // 더 매워요
}

/** 문제별 질문/답변 게시판 */
export interface BoardAnswer {
  id: string;
  questionId: string;
  author: string;
  body: string;
  at: string; // ISO
  spoiler: boolean; // 풀이 내용 포함 여부 (가려서 보여줌)
}

export interface BoardQuestion {
  id: string;
  problemId: string;
  author: string;
  title: string;
  body: string;
  at: string;
  spoiler: boolean;
  /** 채택된 답변 id (데모 글용; 내가 쓴 글은 저장소의 accepted 맵에 기록) */
  accepted?: string;
}
