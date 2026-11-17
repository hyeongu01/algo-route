"use client";

import { PlatformBadge } from "@/components/ui";
import { usePlatforms } from "@/lib/prefs";

/** 설정에서 고른 플랫폼 뱃지 */
export default function MyPlatforms() {
  return (
    <>
      {usePlatforms().map((p) => (
        <PlatformBadge key={p} p={p} />
      ))}
    </>
  );
}
