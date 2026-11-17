import type { Spice } from "./types";

export const SPICE_LEVELS: { level: Spice; name: string; ramen: string; chip: string; fill: string }[] = [
  { level: 1, name: "순한맛", ramen: "안성탕면", chip: "bg-yellow-100 text-yellow-800", fill: "#facc15" },
  { level: 2, name: "보통맛", ramen: "신라면", chip: "bg-orange-100 text-orange-700", fill: "#fb923c" },
  { level: 3, name: "매운맛", ramen: "열라면", chip: "bg-orange-200 text-orange-800", fill: "#f97316" },
  { level: 4, name: "아주 매운맛", ramen: "불닭볶음면", chip: "bg-red-100 text-red-700", fill: "#ef4444" },
  { level: 5, name: "극강 매운맛", ramen: "핵불닭볶음면", chip: "bg-red-200 text-red-900", fill: "#991b1b" },
];

export const spiceInfo = (s: Spice) => SPICE_LEVELS[s - 1];
