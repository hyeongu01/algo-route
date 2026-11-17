import Link from "next/link";
import { Card, SpiceBadge, PlatformBadge, Stat } from "@/components/ui";
import { DifficultyPie, MonthlyBar, TopicRadar } from "@/components/Charts";
import { SPICE_LEVELS } from "@/lib/spice";
import MyPlatforms from "@/components/MyPlatforms";
import SpiceMeter from "@/components/SpiceMeter";
import { heatmap, monthly, mySpice, recent, summary, topicStats } from "@/lib/analysis";

const shade = (c: number) =>
  c < 0 ? "bg-transparent" : c === 0 ? "bg-gray-100" : c === 1 ? "bg-indigo-300" : c === 2 ? "bg-indigo-500" : "bg-indigo-700";

export default function Me() {
  const s = summary();
  const topics = topicStats();
  const radar = topics.filter((t) => t.solved > 0).map((t) => ({ tag: t.tag, solved: t.solved }));
  const untouched = topics.filter((t) => t.solved === 0).map((t) => t.tag);
  const stale = topics.filter((t) => t.idle !== null && t.idle > 45).sort((a, b) => b.idle! - a.idle!).slice(0, 5);
  const my = mySpice();
  const pie = SPICE_LEVELS.map((l) => ({ name: `${l.level} ${l.name}`, value: s.bySpice[l.level], fill: l.fill })).filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">H</div>
          <div>
            <div className="text-lg font-semibold">hyeonwoo</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <MyPlatforms />
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Link href="/my" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              내 풀이 보기
            </Link>
            <Link href="/settings" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              설정
            </Link>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-400">프로필 수정과 계정 연동은 로그인 기능과 함께 추가됩니다.</p>
      </Card>

      <h2 className="pt-2 text-lg font-bold">내 성취</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="푼 문제" value={s.solved} sub={`LeetCode ${s.byPlatform.leetcode} · 프로그래머스 ${s.byPlatform.programmers}`} />
        <Stat label="점수" value={s.score} sub="맵기 1~5단계 = 1·2·3·5·6점" />
        <Stat label="현재 연속" value={`${s.streak}일`} sub="오늘 포함" />
        <Stat label="활동 일수" value={s.activeDays} />
      </div>

      <Card title="활동 (최근 26주)">
        <div className="flex gap-1 overflow-x-auto">
          {heatmap().map((col, i) => (
            <div key={i} className="flex flex-col gap-1">
              {col.map((c) => (
                <div key={c.date} title={`${c.date} · ${Math.max(c.count, 0)}문제`} className={`h-3 w-3 rounded-sm ${shade(c.count)}`} />
              ))}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="월별 풀이" className="md:col-span-2">
          <MonthlyBar data={monthly()} />
        </Card>
        <Card title="맵기 분포">
          {my && <SpiceMeter {...my} />}
          <DifficultyPie data={pie} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="주제별 풀이 수">
          <TopicRadar data={radar} />
        </Card>
        <div className="space-y-4">
          <Card title="오래 안 푼 주제 (45일+)">
            <ul className="space-y-1 text-sm">
              {stale.map((t) => (
                <li key={t.tag} className="flex justify-between">
                  <span>{t.tag}</span>
                  <span className="text-gray-400">{t.idle}일 전</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="아직 시도하지 않은 주제">
            <div className="flex flex-wrap gap-1.5">
              {untouched.map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{t}</span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card title="최근 푼 문제">
        <ul className="divide-y divide-gray-100">
          {recent().map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
              <PlatformBadge p={p.platform} />
              <span className="flex-1">{p.title}</span>
              <SpiceBadge s={p.spice} />
              <span className="w-24 text-right text-gray-400">{p.firstDate}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
