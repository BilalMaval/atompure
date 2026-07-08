"use client";

import { useEffect, useRef } from "react";
import { clsx } from "@/lib/utils";
import { markdownToHtml, looksLikeHtml } from "@/lib/markdown";

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

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

function looksLikeMarkdown(text: string): boolean {
  if (looksLikeHtml(text)) return false;
  return /^#{1,3} |^\s*[-*] |\*\*.+\*\*|__[^_]+__|^\d+\. /m.test(text);
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
    if (!isFirstRender.current || !editorRef.current) return;
    isFirstRender.current = false;

    if (!value) return;

    // If stored value is plain text or markdown, convert to HTML immediately
    const html = looksLikeHtml(value) ? value : markdownToHtml(value);
    editorRef.current.innerHTML = html;

    // Persist the converted HTML so it's saved on next submit
    if (html !== value) {
      onChange(html);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    const htmlData = e.clipboardData.getData("text/html");
    const textData = e.clipboardData.getData("text/plain");

    // Pasted HTML → sanitize and insert
    if (htmlData && htmlData.trim()) {
      e.preventDefault();
      document.execCommand("insertHTML", false, sanitizeHtml(htmlData));
      onChange(editorRef.current?.innerHTML ?? "");
      return;
    }

    // Pasted markdown → convert to HTML and insert
    if (textData && looksLikeMarkdown(textData)) {
      e.preventDefault();
      document.execCommand("insertHTML", false, markdownToHtml(textData));
      onChange(editorRef.current?.innerHTML ?? "");
    }
    // Plain text → browser handles naturally
  }

  return (
    <div className="rounded-lg border border-beige-300 bg-cream-50">
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
