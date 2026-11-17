"use client";

import Markdown from "@/components/Markdown";
import { Card } from "@/components/ui";
import { EDITOR_SIZES, setDefaultLang, setEditorSize, useDefaultLang, useEditorSize } from "@/lib/prefs";
import { LANGS } from "@/lib/solution";

const SAMPLE_MEMO = `## 접근 방법
- 해시맵으로 **마지막 위치**를 저장
- \`left = max(left, last[ch] + 1)\`

> 엣지 케이스: 빈 문자열

- [x] 예제 통과
- [ ] 시간 복잡도 확인`;

const SAMPLE_CODE = `def solve(s):
    last, left, best = {}, 0, 0
    for i, ch in enumerate(s):
        left = max(left, last.get(ch, -1) + 1)
        last[ch] = i
        best = max(best, i - left + 1)
    return best`;

export default function EditorSettings() {
  const size = useEditorSize();
  const lang = useDefaultLang();
  const cur = EDITOR_SIZES.find((s) => s.id === size)!;

  return (
    <div className="space-y-6">
      <Card title="글자 크기">
        <p className="mb-3 text-sm text-gray-500">풀이 화면의 메모장과 풀이(코드) 입력칸에 적용됩니다.</p>
        <div className="flex flex-wrap gap-2">
          {EDITOR_SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => setEditorSize(s.id)}
              aria-pressed={size === s.id}
              className={`rounded-md px-5 py-2 text-sm ${size === s.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold text-gray-500">메모장 미리보기</div>
            <div style={{ fontSize: cur.memoPx }} className="rounded-md border border-gray-200 p-4">
              <Markdown text={SAMPLE_MEMO} />
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-gray-500">풀이 미리보기</div>
            <pre style={{ fontSize: cur.codePx }} className="overflow-auto rounded-md border border-gray-200 bg-gray-50 p-4 font-mono leading-relaxed">
              {SAMPLE_CODE}
            </pre>
          </div>
        </div>
      </Card>

      <Card title="기본 풀이 언어">
        <p className="mb-3 text-sm text-gray-500">풀이 화면에서 처음 선택돼 있는 언어입니다. 문제마다 바꿀 수 있어요.</p>
        <div className="flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <button
              key={l.v}
              onClick={() => setDefaultLang(l.v)}
              aria-pressed={lang === l.v}
              className={`rounded-md px-4 py-1.5 text-sm ${lang === l.v ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
