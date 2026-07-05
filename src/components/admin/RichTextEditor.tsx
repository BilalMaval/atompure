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
  { label: "H2", command: "formatBlock", value: "h2" },
  { label: "H3", command: "formatBlock", value: "h3" },
  { label: "P", command: "formatBlock", value: "p" },
  { label: "• List", command: "insertUnorderedList" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
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

  return (
    <div className="rounded-lg border border-beige-300 bg-cream-50">
      <div className="flex flex-wrap gap-1 border-b border-beige-200 p-2">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => runCommand(action)}
            className="rounded px-2 py-1 text-xs font-medium text-charcoal-700 hover:bg-beige-100"
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleLink}
          className="rounded px-2 py-1 text-xs font-medium text-charcoal-700 hover:bg-beige-100"
        >
          Link
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        onBlur={() => onChange(editorRef.current?.innerHTML ?? "")}
        data-placeholder={placeholder}
        className={clsx(
          "min-h-48 p-4 text-sm text-charcoal-800 focus:outline-none",
          "empty:before:text-charcoal-400 empty:before:content-[attr(data-placeholder)]"
        )}
        suppressContentEditableWarning
      />
    </div>
  );
}
