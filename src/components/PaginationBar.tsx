"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationBarProps = {
	page: number;
	totalPages: number;
	total: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	pageSizeOptions?: number[];
	onPageSizeChange?: (pageSize: number) => void;
	label?: string;
};

export function PaginationBar({
	page,
	totalPages,
	total,
	pageSize,
	onPageChange,
	pageSizeOptions = [5, 10, 20, 50],
	onPageSizeChange,
	label = "Items",
}: PaginationBarProps) {
	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
			<div className="flex items-center gap-4">
				<p className="text-[13px] text-muted-foreground">
					<span className="font-medium text-foreground">{from}</span>
					{" – "}
					<span className="font-medium text-foreground">{to}</span>
					{" of "}
					<span className="font-medium text-foreground">{total}</span>{" "}
					{label.toLowerCase()}
				</p>
				{onPageSizeChange && (
					<select
						aria-label="Items per page"
						className="rounded-md border border-input bg-background px-2 py-1 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						onChange={(e) => onPageSizeChange(Number(e.target.value))}
						value={pageSize}
					>
						{pageSizeOptions.map((n) => (
							<option key={n} value={n}>
								{n} per page
							</option>
						))}
					</select>
				)}
			</div>
			<div className="flex items-center gap-1">
				<button
					aria-label="Previous page"
					className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
					type="button"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
				<span className="min-w-[7rem] text-center text-[13px] text-muted-foreground">
					Page <span className="font-medium text-foreground">{page}</span> of{" "}
					<span className="font-medium text-foreground">{totalPages}</span>
				</span>
				<button
					aria-label="Next page"
					className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
					type="button"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
