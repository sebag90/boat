import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: true })

/** Renders Markdown to sanitized HTML for read-only views. */
export function renderMarkdown(source?: string | null): string {
  if (!source?.trim()) return ''
  const html = marked.parse(source, { async: false }) as string
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] })
}
