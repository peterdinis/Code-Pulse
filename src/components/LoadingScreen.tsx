"use client";

type LoadingScreenProps = {
	label?: string;
	className?: string;
};

export function LoadingScreen({
	label = "Loading…",
	className = "",
}: LoadingScreenProps) {
	return (
		<div
			aria-busy="true"
			aria-live="polite"
			className={`flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-6 ${className}`}
		>
			{/* Animated pulse rings + center dot */}
			<div className="relative flex h-24 w-24 items-center justify-center">
				<span
					className="absolute inset-0 animate-loading-ping rounded-full bg-primary/20"
					style={{ animationDelay: "0ms" }}
				/>
				<span
					className="absolute inset-0 animate-loading-ping rounded-full bg-primary/25"
					style={{ animationDelay: "200ms" }}
				/>
				<span
					className="absolute inset-0 animate-loading-ping rounded-full bg-primary/30"
					style={{ animationDelay: "400ms" }}
				/>
				<span className="relative h-10 w-10 animate-loading-pulse rounded-full bg-primary/90 shadow-lg shadow-primary/30" />
			</div>

			{/* Label + shimmer line */}
			<div className="flex flex-col items-center gap-3">
				<p className="font-medium text-foreground text-sm">{label}</p>
				<div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
					<div className="h-full w-1/2 animate-loading-shimmer rounded-full bg-primary" />
				</div>
			</div>
		</div>
	);
}
