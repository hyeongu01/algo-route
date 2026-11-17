import type { RankUser } from "@/lib/types";

// Mock users. "me" is injected from real seed data in lib/analysis.ts.
export const otherUsers: RankUser[] = [
  { name: "codefox", solved: 412, score: 1390, weekly: 18, streak: 63, platforms: ["leetcode", "programmers"] },
  { name: "bit_walker", solved: 305, score: 1022, weekly: 14, streak: 41, platforms: ["leetcode"] },
  { name: "dp마스터", solved: 288, score: 998, weekly: 9, streak: 12, platforms: ["programmers", "leetcode"] },
  { name: "graphy", solved: 241, score: 801, weekly: 11, streak: 25, platforms: ["leetcode"] },
  { name: "stack_overflowed", solved: 176, score: 512, weekly: 7, streak: 8, platforms: ["programmers"] },
  { name: "daily_kim", solved: 120, score: 340, weekly: 6, streak: 30, platforms: ["programmers", "leetcode"] },
  { name: "newbie_lee", solved: 64, score: 160, weekly: 5, streak: 4, platforms: ["programmers"] },
  { name: "heap_hero", solved: 52, score: 149, weekly: 2, streak: 3, platforms: ["leetcode"] },
  { name: "twopointer", solved: 38, score: 101, weekly: 3, streak: 2, platforms: ["leetcode"] },
];
