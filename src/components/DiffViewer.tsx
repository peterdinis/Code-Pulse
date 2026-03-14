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

export function DiffViewer({
	content,
	className,
}: {
	content: string;
	className?: string;
}) {
	const lines = parseDiff(content);

	if (lines.length === 0) {
		return (
			<div
				className={`flex min-h-[120px] items-center justify-center rounded-lg border border-border bg-muted/20 font-mono text-[13px] text-muted-foreground ${className ?? ""}`}
			>
				No diff to display. Paste a git diff above and save.
			</div>
		);
	}

	return (
		<div
			className={`diff-theme overflow-x-auto rounded-lg font-mono text-[13px] leading-relaxed ${className ?? ""}`}
		>
			<div className="min-w-max">
				{lines.map((line, i) => (
					<div
						className={`flex border-[var(--code-border)]/50 border-b last:border-b-0 ${
							line.type === "add"
								? "diff-add"
								: line.type === "remove"
									? "diff-remove"
									: "diff-context bg-transparent"
						}`}
						key={i}
					>
						<span className="w-8 shrink-0 select-none border-[var(--code-border)]/50 border-r py-0.5 pr-2 text-right opacity-60">
							{line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
						</span>
						<span className="whitespace-pre-wrap break-all py-0.5 pl-2">
							{line.text || " "}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
