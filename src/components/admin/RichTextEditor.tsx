"use client";

import { useEffect, useRef } from "react";
import { clsx } from "@/lib/utils";

interface ToolbarAction {
  label: string;
  command: string;
  value?: string;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "B", command: "bold" },
  { label: "I", command: "italic" },
  { label: "U", command: "underline" },
  { label: "S", command: "strikeThrough" },
  { label: "H2", command: "formatBlock", value: "h2" },
  { label: "H3", command: "formatBlock", value: "h3" },
  { label: "P", command: "formatBlock", value: "p" },
  { label: "• List", command: "insertUnorderedList" },
  { label: "1. List", command: "insertOrderedList" },
];

// Lightweight markdown → HTML converter (handles common patterns)
function markdownToHtml(md: string): string {
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
      // blank line = paragraph break (already handled by block structure)
    } else {
      closeList();
      out.push(`<p>${inlineFormat(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}

// Detect if a string looks like markdown (has md syntax but no HTML tags)
function looksLikeMarkdown(text: string): boolean {
  const hasHtml = /<[a-z][\s\S]*>/i.test(text);
  if (hasHtml) return false;
  return /^#{1,3} |^\s*[-*] |\*\*.+\*\*|__[^_]+__|^\d+\. /m.test(text);
}

// Strip dangerous tags from pasted HTML
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = "min-h-48",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      isFirstRender.current = false;
    }
  }, [value]);

  function runCommand(action: ToolbarAction) {
    editorRef.current?.focus();
    document.execCommand(action.command, false, action.value);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function handleLink() {
    const url = window.prompt("Link URL");
    if (!url) return;
    editorRef.current?.focus();
    document.execCommand("createLink", false, url);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData("text/html");
    const textData = clipboardData.getData("text/plain");

    // If clipboard has HTML content, use sanitized HTML
    if (htmlData && htmlData.trim()) {
      e.preventDefault();
      const clean = sanitizeHtml(htmlData);
      document.execCommand("insertHTML", false, clean);
      onChange(editorRef.current?.innerHTML ?? "");
      return;
    }

    // If plain text looks like markdown, convert it
    if (textData && looksLikeMarkdown(textData)) {
      e.preventDefault();
      const html = markdownToHtml(textData);
      document.execCommand("insertHTML", false, html);
      onChange(editorRef.current?.innerHTML ?? "");
    }
    // Otherwise let the browser handle it naturally (plain text paste)
  }

  return (
    <div className="rounded-lg border border-beige-300 bg-cream-50">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-beige-200 p-2">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); runCommand(action); }}
            className="rounded px-2 py-1 text-xs font-medium text-charcoal-700 hover:bg-beige-100"
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleLink(); }}
          className="rounded px-2 py-1 text-xs font-medium text-charcoal-700 hover:bg-beige-100"
        >
          Link
        </button>
        <span className="ml-auto self-center text-[10px] text-charcoal-400">
          Supports markdown &amp; HTML paste
        </span>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        onBlur={() => onChange(editorRef.current?.innerHTML ?? "")}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className={clsx(
          minHeight,
          "p-4 text-sm text-charcoal-800 focus:outline-none",
          "empty:before:text-charcoal-400 empty:before:content-[attr(data-placeholder)]",
          // Style HTML content rendered inside the editor
          "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold",
          "[&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold",
          "[&_p]:my-2 [&_p]:leading-relaxed",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_li]:my-0.5",
          "[&_strong]:font-semibold",
          "[&_a]:text-sage-700 [&_a]:underline",
          "[&_code]:rounded [&_code]:bg-beige-100 [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs",
          "[&_s]:text-charcoal-400"
        )}
        suppressContentEditableWarning
      />
    </div>
  );
}
