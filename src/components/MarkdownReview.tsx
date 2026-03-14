"use client";

import { createElement, type ReactNode } from "react";

type Segment = { type: "text" | "bold" | "code"; content: string };

function parseInline(text: string): Segment[] {
  const segments: Segment[] = [];
  let rest = text;
  while (rest.length > 0) {
    const boldMatch = rest.match(/\*\*(.+?)\*\*/);
    const codeMatch = rest.match(/`([^`]+)`/);
    let match: RegExpMatchArray | null = null;
    let type: "bold" | "code" = "bold";
    let index = rest.length;
    if (boldMatch && boldMatch.index !== undefined) {
      match = boldMatch;
      type = "bold";
      index = boldMatch.index;
    }
    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < index) {
      match = codeMatch;
      type = "code";
      index = codeMatch.index;
    }
    if (match && match.index !== undefined) {
      if (index > 0) {
        segments.push({ type: "text", content: rest.slice(0, index) });
      }
      segments.push({
        type,
        content: type === "bold" ? match[1] ?? "" : match[1] ?? "",
      });
      rest = rest.slice(index + match[0].length);
    } else {
      segments.push({ type: "text", content: rest });
      break;
    }
  }
  return segments;
}

function renderInline(segments: Segment[]): ReactNode[] {
  return segments.map((s, i) => {
    if (s.type === "text") return s.content;
    if (s.type === "bold")
      return createElement("strong", { key: i, className: "font-semibold text-foreground" }, s.content);
    if (s.type === "code")
      return createElement(
        "code",
        {
          key: i,
          "data-inline-code": "",
          className: "code-theme",
        },
        s.content,
      );
    return s.content;
  });
}

export function MarkdownReview({ content, className }: { content: string; className?: string }) {
  if (!content.trim()) return null;

  const blocks: ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;
  let listKey = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line == null) {
      i++;
      continue;
    }
    const trimmed = line.trimEnd();

    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) {
        codeLines.push(lines[i]!);
        i++;
      }
      i++;
      blocks.push(
        createElement(
          "pre",
          {
            key: blocks.length,
            "data-code-theme": "",
            className: "code-theme p-4 overflow-x-auto my-3",
          },
          createElement("code", {}, codeLines.join("\n")),
        ),
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(
        createElement(
          "h4",
          {
            key: blocks.length,
            className: "text-sm font-semibold text-foreground mt-4 mb-1.5 scroll-mt-4",
          },
          ...renderInline(parseInline(trimmed.slice(4))),
        ),
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        createElement(
          "h3",
          {
            key: blocks.length,
            className: "text-base font-semibold text-foreground mt-5 mb-2 scroll-mt-4 first:mt-0",
          },
          ...renderInline(parseInline(trimmed.slice(3))),
        ),
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push(
        createElement(
          "h2",
          {
            key: blocks.length,
            className: "text-lg font-semibold text-foreground mt-4 mb-2 scroll-mt-4",
          },
          ...renderInline(parseInline(trimmed.slice(2))),
        ),
      );
      i++;
      continue;
    }

    if (/^[-*] /.test(trimmed) || /^\d+\. /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && (lines[i]!.startsWith("- ") || lines[i]!.startsWith("* ") || /^\d+\. /.test(lines[i]!.trimStart()))) {
        const raw = lines[i]!;
        const bullet = raw.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
        items.push(bullet);
        i++;
      }
      blocks.push(
        createElement(
          "ul",
          {
            key: blocks.length,
            className: "list-disc list-inside space-y-1 my-2 text-[13px] text-muted-foreground",
          },
          items.map((item, j) =>
            createElement(
              "li",
              { key: j, className: "leading-relaxed" },
              ...renderInline(parseInline(item)),
            ),
          ),
        ),
      );
      listKey++;
      continue;
    }

    if (trimmed === "") {
      i++;
      continue;
    }

    blocks.push(
      createElement(
        "p",
        {
          key: blocks.length,
          className: "text-[13px] text-muted-foreground leading-relaxed my-1.5",
        },
        ...renderInline(parseInline(trimmed)),
      ),
    );
    i++;
  }

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className ?? ""}`}>
      <div className="space-y-0.5">{blocks}</div>
    </div>
  );
}
