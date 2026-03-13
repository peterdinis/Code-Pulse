"use client";

type DiffLine = { type: "add" | "remove" | "context"; text: string };

function parseDiff(raw: string): DiffLine[] {
  if (!raw.trim()) return [];
  return raw.split("\n").map((line) => {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      return { type: "add", text: line.slice(1) || " " };
    }
    if (line.startsWith("-") && !line.startsWith("---")) {
      return { type: "remove", text: line.slice(1) || " " };
    }
    return { type: "context", text: line };
  });
}

export function DiffViewer({ content, className }: { content: string; className?: string }) {
  const lines = parseDiff(content);

  if (lines.length === 0) {
    return (
      <div
        className={`rounded-lg border border-border bg-muted/20 font-mono text-[13px] text-muted-foreground flex items-center justify-center min-h-[120px] ${className ?? ""}`}
      >
        No diff to display. Paste a git diff above and save.
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-lg border border-border bg-[#0d1117] font-mono text-[13px] leading-relaxed ${className ?? ""}`}
    >
      <div className="min-w-max">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`flex border-b border-border/50 last:border-b-0 ${
              line.type === "add"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : line.type === "remove"
                  ? "bg-red-500/10 text-red-700 dark:text-red-300"
                  : "text-muted-foreground bg-transparent"
            }`}
          >
            <span className="w-8 shrink-0 select-none pr-2 text-right text-muted-foreground/70 border-r border-border/50 py-0.5">
              {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
            </span>
            <span className="py-0.5 pl-2 break-all whitespace-pre-wrap">{line.text || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
