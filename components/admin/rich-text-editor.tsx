"use client";

import { useEffect, useRef, useState } from "react";
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
      const linkedImage = element.children.length === 1 && element.firstElementChild?.tagName === "IMG"
        ? element.firstElementChild as HTMLImageElement
        : null;
      if (href && linkedImage) {
        const source = linkedImage.getAttribute("src") ?? "";
        const alt = (linkedImage.getAttribute("alt") ?? "Image").replace(/]/g, "\\]");
        return source ? `\n\n[![${alt}](${source})](${href})\n\n` : "";
      }
      return href ? `[${content || href}](${href})` : content;
    }
    case "IMG": {
      const source = element.getAttribute("src") ?? "";
      const alt = (element.getAttribute("alt") ?? "Image").replace(/]/g, "\\]");
      return source ? `\n\n![${alt}](${source})\n\n` : "";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const initializedRef = useRef(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

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
    const selectedImage = selectedImageRef.current;
    const currentUrl = selectedImage?.parentElement?.tagName === "A"
      ? selectedImage.parentElement.getAttribute("href") || "https://"
      : "https://";
    const url = window.prompt(selectedImage ? "Image link URL" : "Link URL", currentUrl);
    if (!url) return;

    if (selectedImage) {
      if (selectedImage.parentElement?.tagName === "A") {
        selectedImage.parentElement.setAttribute("href", url);
      } else {
        const link = document.createElement("a");
        link.href = url;
        selectedImage.replaceWith(link);
        link.append(selectedImage);
      }
      syncValue();
      return;
    }

    runCommand("createLink", url);
  };

  const rememberSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) savedRangeRef.current = range.cloneRange();
  };

  const insertImage = (source: string, alt: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const image = document.createElement("img");
    image.src = source;
    image.alt = alt;
    image.dataset.selectedImage = "true";
    selectedImageRef.current?.removeAttribute("data-selected-image");
    selectedImageRef.current = image;

    const range = savedRangeRef.current;
    if (range && editor.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(image);
      range.setStartAfter(image);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else {
      editor.append(image);
    }

    editor.focus();
    syncValue();
  };

  const selectImage = (event: React.MouseEvent<HTMLDivElement>) => {
    selectedImageRef.current?.removeAttribute("data-selected-image");
    const target = event.target instanceof HTMLImageElement ? event.target : null;
    selectedImageRef.current = target;
    target?.setAttribute("data-selected-image", "true");
  };

  const uploadInlineImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setImageError("");

    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: data });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Image upload failed");
      insertImage(result.url, file.name.replace(/\.[^.]+$/, "") || "Article image");
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const toolbarButton = "grid size-8 place-items-center rounded-md text-xs font-bold text-slate-300 transition hover:bg-(--color-surface-raised) hover:text-white";

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg) focus-within:border-(--color-brand-border)">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-(--color-border) bg-(--color-surface-muted) px-2 py-1.5">

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
        <button
          type="button"
          className={toolbarButton}
          disabled={uploadingImage}
          onMouseDown={(event) => { event.preventDefault(); rememberSelection(); }}
          onClick={() => fileInputRef.current?.click()}
          title="Insert image"
        >
          {uploadingImage ? "…" : "▧"}
        </button>
        <button type="button" className={toolbarButton} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("removeFormat")} title="Clear formatting">Tx</button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadInlineImage} hidden />
      </div>
      {imageError && <p className="border-b border-(--color-border) px-3 py-2 text-xs font-semibold text-rose-400">{imageError}</p>}

      <div
        ref={editorRef}
        id="article-body"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Article body"
        onInput={syncValue}
        onClick={selectImage}
        className="article-content min-h-96 px-5 py-4 text-sm outline-none empty:before:pointer-events-none empty:before:text-slate-500 empty:before:content-['Start_writing_your_article…']"
      />
      <textarea name="body" value={value} readOnly hidden />
      <div ref={sourceRef} hidden>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
      </div>
    </div>
  );
}
