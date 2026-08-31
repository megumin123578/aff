"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function nodeContents(node: Node): string {
  return Array.from(node.childNodes).map(nodeToMarkdown).join("");
}

function listItemContents(node: Node): string {
  return nodeContents(node).trim().replace(/\n{2,}/g, "\n").replace(/\n/g, "\n  ");
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/\u00a0/g, " ");
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const element = node as HTMLElement;
  const content = nodeContents(element);

  switch (element.tagName) {
    case "H1": return `# ${content.trim()}\n\n`;
    case "H2": return `## ${content.trim()}\n\n`;
    case "H3": return `### ${content.trim()}\n\n`;
    case "P":
    case "DIV": return content.trim() ? `${content.trim()}\n\n` : "\n";
    case "BR": return "\n";
    case "STRONG":
    case "B": return content.trim() ? `**${content}**` : "";
    case "EM":
    case "I": return content.trim() ? `*${content}*` : "";
    case "S":
    case "STRIKE": return content.trim() ? `~~${content}~~` : "";
    case "BLOCKQUOTE": return `${content.trim().split("\n").map((line) => `> ${line}`).join("\n")}\n\n`;
    case "UL": return `${Array.from(element.children).map((item) => `- ${listItemContents(item)}`).join("\n")}\n\n`;
    case "OL": return `${Array.from(element.children).map((item, index) => `${index + 1}. ${listItemContents(item)}`).join("\n")}\n\n`;
    case "LI": return content;
    case "A": {
      const href = element.getAttribute("href") ?? "";
      return href ? `[${content || href}](${href})` : content;
    }
    case "CODE": return `\`${content.replace(/`/g, "\\`")}\``;
    case "PRE": return `\n\n\`\`\`\n${element.textContent?.trim() ?? ""}\n\`\`\`\n\n`;
    default: return content;
  }
}

function editorToMarkdown(editor: HTMLElement) {
  return nodeContents(editor).replace(/\n{3,}/g, "\n\n").trim();
}

type RichTextEditorProps = {
  value: string;
  onChangeAction: (value: string) => void;
};

export function RichTextEditor({ value, onChangeAction }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !editorRef.current || !sourceRef.current) return;
    editorRef.current.innerHTML = sourceRef.current.innerHTML;
    initializedRef.current = true;
  }, []);

  const syncValue = () => {
    if (editorRef.current) onChangeAction(editorToMarkdown(editorRef.current));
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncValue();
  };

  const addLink = () => {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    runCommand("createLink", url);
  };

  const toolbarButton = "grid size-8 place-items-center rounded-md text-xs font-bold text-slate-300 transition hover:bg-(--color-surface-raised) hover:text-white";

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg) focus-within:border-(--color-brand-border)">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-(--color-border) bg-(--color-surface-muted) px-2 py-1.5">
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("undo")} title="Undo">↶</button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("redo")} title="Redo">↷</button>
        <span className="mx-1 h-5 w-px bg-(--color-border)" />
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "p")} title="Paragraph">¶</button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "h2")} title="Heading 2">H2</button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "h3")} title="Heading 3">H3</button>
        <span className="mx-1 h-5 w-px bg-(--color-border)" />
        <button type="button" className={`${toolbarButton} text-sm`} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("bold")} title="Bold">B</button>
        <button type="button" className={`${toolbarButton} text-sm italic`} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("italic")} title="Italic">I</button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("strikeThrough")} title="Strikethrough">S̶</button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "blockquote")} title="Quote">❝</button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertUnorderedList")} title="Bullet list">•</button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertOrderedList")} title="Numbered list">1.</button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={addLink} title="Insert link">🔗</button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("removeFormat")} title="Clear formatting">Tx</button>
      </div>

      <div
        ref={editorRef}
        id="article-body"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Article body"
        onInput={syncValue}
        className="article-content min-h-96 px-5 py-4 text-sm outline-none empty:before:pointer-events-none empty:before:text-slate-500 empty:before:content-['Start_writing_your_article…']"
      />
      <textarea name="body" value={value} readOnly hidden />
      <div ref={sourceRef} hidden>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
      </div>
    </div>
  );
}
