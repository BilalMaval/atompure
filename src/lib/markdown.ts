/** Returns true when the string contains HTML tags (already rich text). */
export function looksLikeHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

/** Lightweight markdown → HTML. Handles headings, lists, bold, italic, links. */
export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  function closeList() {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  }

  function inlineFormat(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<s>$1</s>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^### (.+)/.test(line)) {
      closeList();
      out.push(`<h3>${inlineFormat(line.replace(/^### /, ""))}</h3>`);
    } else if (/^## (.+)/.test(line)) {
      closeList();
      out.push(`<h2>${inlineFormat(line.replace(/^## /, ""))}</h2>`);
    } else if (/^# (.+)/.test(line)) {
      closeList();
      out.push(`<h1>${inlineFormat(line.replace(/^# /, ""))}</h1>`);
    } else if (/^[-*] (.+)/.test(line)) {
      if (!inUl) { if (inOl) { out.push("</ol>"); inOl = false; } out.push("<ul>"); inUl = true; }
      out.push(`<li>${inlineFormat(line.replace(/^[-*] /, ""))}</li>`);
    } else if (/^\d+\. (.+)/.test(line)) {
      if (!inOl) { if (inUl) { out.push("</ul>"); inUl = false; } out.push("<ol>"); inOl = true; }
      out.push(`<li>${inlineFormat(line.replace(/^\d+\. /, ""))}</li>`);
    } else if (line === "") {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inlineFormat(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}

/**
 * Returns the content ready for dangerouslySetInnerHTML.
 * If the stored value is already HTML, return as-is.
 * If it's plain/markdown text, convert it first.
 */
export function toRichHtml(content: string | null | undefined): string {
  if (!content) return "";
  return looksLikeHtml(content) ? content : markdownToHtml(content);
}
