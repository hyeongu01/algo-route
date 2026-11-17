"use client";

import { useState } from "react";
import Markdown from "@/components/Markdown";

/**
 * 노션처럼: 쓰는 동안은 입력칸, 영역 밖을 누르면 마크다운으로 렌더링된 화면.
 * 렌더링된 화면을 누르면 다시 편집. 내용이 비어 있으면 항상 입력칸.
 */
export default function MemoEditor({
  value,
  onChange,
  sizePx,
  readOnly = false,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  sizePx: number;
  readOnly?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(true);
  const showEdit = !readOnly && (editing || !value.trim());

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-2 flex shrink-0 items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-500">메모장</h2>
        <span className="text-xs text-gray-400">마크다운 지원{!readOnly && " · 영역 밖을 누르면 미리보기"}</span>
        {!readOnly && (
          <button
            // 클릭 시 textarea의 blur가 먼저 일어나 토글이 뒤집히는 걸 막는다
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setEditing(!showEdit)}
            className="ml-auto rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            {showEdit ? "미리보기" : "편집"}
          </button>
        )}
      </div>

      {showEdit ? (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => value.trim() && setEditing(false)}
          spellCheck={false}
          placeholder={"# 접근 방법\n- 아이디어, 막힌 지점을 마크다운으로 적어두세요\n- `코드`, **굵게**, - [ ] 체크리스트도 돼요"}
          style={{ fontSize: sizePx }}
          className="min-h-0 w-full flex-1 resize-none rounded-md border border-gray-200 p-4 leading-relaxed focus:border-indigo-400 focus:outline-none"
        />
      ) : (
        <div
          onClick={() => !readOnly && setEditing(true)}
          style={{ fontSize: sizePx }}
          className={`min-h-0 flex-1 overflow-auto rounded-md border border-gray-200 p-4 ${readOnly ? "" : "cursor-text"}`}
        >
          {value.trim() ? <Markdown text={value} /> : <p className="text-sm text-gray-400">메모가 없어요.</p>}
        </div>
      )}
    </div>
  );
}
