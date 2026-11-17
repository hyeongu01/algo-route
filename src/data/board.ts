import type { BoardAnswer, BoardQuestion } from "@/lib/types";

// 데모용 질문/답변. 실제 서비스에서는 서버(DB)에서 가져온다.
export const seedQuestions: BoardQuestion[] = [
  {
    id: "seed-q1",
    problemId: "leetcode:longest-substring-without-repeating-characters",
    author: "codefox",
    title: "left 포인터를 언제 움직여야 하나요?",
    body: "슬라이딩 윈도우로 풀려는데, 중복 문자를 만났을 때 left를 한 칸씩 옮기는 게 맞는지, 한 번에 점프해도 되는지 헷갈려요.",
    at: "2026-11-03T10:20:00Z",
    spoiler: false,
    accepted: "seed-a1",
  },
  {
    id: "seed-q2",
    problemId: "leetcode:climbing-stairs",
    author: "newbie_lee",
    title: "dp 말고 다른 풀이도 있나요?",
    body: "재귀로 풀었더니 시간 초과가 났어요. 메모이제이션 말고도 방법이 있을까요?",
    at: "2026-11-06T08:05:00Z",
    spoiler: false,
  },
  {
    id: "seed-q3",
    problemId: "leetcode:house-robber",
    author: "stack_overflowed",
    title: "점화식이 잘 이해가 안 돼요",
    body: "dp[i] = max(dp[i-1], dp[i-2] + nums[i]) 에서 왜 i-2까지만 보면 되는지 궁금합니다.",
    at: "2026-11-09T14:40:00Z",
    spoiler: false,
  },
  {
    id: "seed-q4",
    problemId: "programmers:43238",
    author: "dp마스터",
    title: "이분탐색 상한을 어떻게 잡나요?",
    body: "right를 너무 크게 잡으면 오버플로가 날까 걱정돼요. 보통 어떻게 정하시나요?",
    at: "2026-11-12T19:15:00Z",
    spoiler: false,
    accepted: "seed-a4",
  },
];

export const seedAnswers: BoardAnswer[] = [
  {
    id: "seed-a1",
    questionId: "seed-q1",
    author: "bit_walker",
    body: "문자별 마지막 위치를 해시맵에 저장해두고, 중복이면 left = max(left, 마지막 위치 + 1) 로 점프하면 한 번에 정리돼요. left가 뒤로 가지 않게 max가 꼭 필요합니다.",
    at: "2026-11-03T12:00:00Z",
    spoiler: true,
  },
  {
    id: "seed-a2",
    questionId: "seed-q2",
    author: "graphy",
    body: "결국 피보나치 수열이라서, 직전 두 값만 변수로 들고 가면 O(1) 공간으로 풀 수 있어요.",
    at: "2026-11-06T09:30:00Z",
    spoiler: true,
  },
  {
    id: "seed-a3",
    questionId: "seed-q3",
    author: "codefox",
    body: "i번째 집을 털면 바로 이웃(i-1)은 못 털고, 그 전(i-2)까지의 최댓값에 더하면 되기 때문이에요. i-3 이전은 이미 dp[i-2]에 반영돼 있어서 볼 필요가 없습니다.",
    at: "2026-11-09T16:10:00Z",
    spoiler: true,
  },
  {
    id: "seed-a4",
    questionId: "seed-q4",
    author: "heap_hero",
    body: "가장 오래 걸리는 심사관 시간 × 인원 수를 상한으로 잡으면 충분해요. 파이썬은 오버플로 걱정이 없고, Java/C++은 long을 쓰세요.",
    at: "2026-11-12T20:00:00Z",
    spoiler: false,
  },
];
