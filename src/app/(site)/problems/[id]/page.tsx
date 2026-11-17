import Link from "next/link";
import { notFound } from "next/navigation";
import AttemptHistory from "@/components/AttemptHistory";
import QnaLink from "@/components/QnaLink";
import ProblemWorkspace from "@/components/ProblemWorkspace";
import { catalog, getProblem } from "@/lib/analysis";
import type { Problem } from "@/lib/types";
import { idFromSlug, slugOf } from "@/lib/slug";

export function generateStaticParams() {
  return catalog().map((p) => ({ id: slugOf(p.id) }));
}

export default async function ProblemDetail(props: PageProps<"/problems/[id]">) {
  const { id } = await props.params;
  const problem = getProblem(idFromSlug(id));
  if (!problem) notFound();
  // 못 풀었을 때 권하는 워밍업: 키워드가 겹치고 더 순한 문제 (안 푼/못 푼 우선, 겹치는 키워드 많은 순)
  const overlap = (p: Problem) => p.tags.filter((t) => problem.tags.includes(t)).length;
  const related = catalog()
    .filter((p) => p.id !== problem.id && p.spice < problem.spice && overlap(p) > 0)
    .sort((a, b) => Number(a.status === "solved") - Number(b.status === "solved") || overlap(b) - overlap(a) || b.spice - a.spice)
    .slice(0, 3);
  return (
    <div className="space-y-4">
      <Link href="/problems" className="text-sm text-gray-500 hover:text-indigo-600">
        ← 전체 문제
      </Link>
      <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
        <div className="order-2 space-y-4 lg:sticky lg:top-4 lg:order-1">
          <AttemptHistory problem={problem} />
          <QnaLink problem={problem} />
        </div>
        <div className="order-1 min-w-0 lg:order-2">
          <ProblemWorkspace problem={problem} related={related} />
        </div>
      </div>
    </div>
  );
}
