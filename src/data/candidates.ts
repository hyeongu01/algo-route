import type { Candidate } from "@/lib/types";

const lc = (slug: string) => `https://leetcode.com/problems/${slug}`;
const pg = (n: number) => `https://school.programmers.co.kr/learn/courses/30/lessons/${n}`;

// Mock recommendation pool (well-known problems; not exhaustive).
export const candidates: Candidate[] = [
  { id: "leetcode:binary-search", platform: "leetcode", title: "Binary Search", url: lc("binary-search"), tags: ["binary-search", "array"], spice: 1 },
  { id: "leetcode:koko-eating-bananas", platform: "leetcode", title: "Koko Eating Bananas", url: lc("koko-eating-bananas"), tags: ["binary-search"], spice: 3 },
  { id: "programmers:43238", platform: "programmers", title: "입국심사", url: pg(43238), tags: ["binary-search"], spice: 5 },
  { id: "leetcode:climbing-stairs", platform: "leetcode", title: "Climbing Stairs", url: lc("climbing-stairs"), tags: ["dp"], spice: 1 },
  { id: "leetcode:house-robber", platform: "leetcode", title: "House Robber", url: lc("house-robber"), tags: ["dp", "array"], spice: 3 },
  { id: "leetcode:coin-change", platform: "leetcode", title: "Coin Change", url: lc("coin-change"), tags: ["dp"], spice: 3 },
  { id: "leetcode:number-of-islands", platform: "leetcode", title: "Number of Islands", url: lc("number-of-islands"), tags: ["graph", "matrix"], spice: 3 },
  { id: "leetcode:course-schedule", platform: "leetcode", title: "Course Schedule", url: lc("course-schedule"), tags: ["graph"], spice: 3 },
  { id: "programmers:43162", platform: "programmers", title: "네트워크", url: pg(43162), tags: ["graph", "union-find"], spice: 3 },
  { id: "programmers:43165", platform: "programmers", title: "타겟 넘버", url: pg(43165), tags: ["backtracking", "recursion"], spice: 3 },
  { id: "leetcode:subsets", platform: "leetcode", title: "Subsets", url: lc("subsets"), tags: ["backtracking"], spice: 3 },
  { id: "leetcode:implement-trie-prefix-tree", platform: "leetcode", title: "Implement Trie (Prefix Tree)", url: lc("implement-trie-prefix-tree"), tags: ["trie", "string"], spice: 3 },
  { id: "leetcode:number-of-provinces", platform: "leetcode", title: "Number of Provinces", url: lc("number-of-provinces"), tags: ["union-find", "graph"], spice: 3 },
  { id: "programmers:42626", platform: "programmers", title: "더 맵게", url: pg(42626), tags: ["heap"], spice: 3 },
  { id: "programmers:42587", platform: "programmers", title: "프로세스", url: pg(42587), tags: ["queue"], spice: 3 },
  { id: "programmers:12909", platform: "programmers", title: "올바른 괄호", url: pg(12909), tags: ["stack", "string"], spice: 1 },
  { id: "programmers:42577", platform: "programmers", title: "전화번호 목록", url: pg(42577), tags: ["hash-map", "string"], spice: 3 },
  { id: "programmers:42885", platform: "programmers", title: "구명보트", url: pg(42885), tags: ["greedy", "two-pointers"], spice: 3 },
  { id: "leetcode:merge-intervals", platform: "leetcode", title: "Merge Intervals", url: lc("merge-intervals"), tags: ["sorting", "array"], spice: 3 },
  { id: "leetcode:kth-largest-element-in-an-array", platform: "leetcode", title: "Kth Largest Element in an Array", url: lc("kth-largest-element-in-an-array"), tags: ["heap", "sorting"], spice: 3 },
];
