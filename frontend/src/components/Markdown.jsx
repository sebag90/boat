import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

export default function Markdown({ text }) {
  if (!text || !text.trim()) {
    return <div className="muted">No description.</div>;
  }
  return (
    <div
      className="markdown"
      dangerouslySetInnerHTML={{ __html: marked.parse(text) }}
    />
  );
}
