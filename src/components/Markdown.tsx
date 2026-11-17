import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** 마크다운 렌더링 (GFM: 표, 체크리스트, 취소선). 원시 HTML은 렌더하지 않고 위험한 링크 스킴은 제거된다. */
export default function Markdown({ text }: { text: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
