import Link from "next/link";
import { notFound } from "next/navigation";
import QnaPage from "@/components/QnaPage";
import { PlatformBadge, SpiceBadge } from "@/components/ui";
import { catalog, getProblem } from "@/lib/analysis";
import { idFromSlug, problemHref, slugOf } from "@/lib/slug";

export function generateStaticParams() {
  return catalog().map((p) => ({ id: slugOf(p.id) }));
}

export default async function Qna(props: PageProps<"/problems/[id]/qna">) {
  const { id } = await props.params;
  const problem = getProblem(idFromSlug(id));
  if (!problem) notFound();

  return (
    <div className="space-y-4">
      <Link href={problemHref(problem.id)} className="text-sm text-gray-500 hover:text-indigo-600">
        ← {problem.title}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <PlatformBadge p={problem.platform} />
        <SpiceBadge s={problem.spice} />
      </div>
      <h1 className="text-2xl font-bold">질문 &amp; 답변</h1>
      <p className="text-sm text-gray-500">{problem.title}</p>
      <QnaPage problem={problem} />
    </div>
  );
}
