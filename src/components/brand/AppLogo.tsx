import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";

type AppLogoProps = {
	className?: string;
	href?: ComponentProps<typeof Link>["href"];
	size?: "sm" | "md";
};

/**
 * Consistent wordmark + pulse mark for marketing and app chrome.
 */
export function AppLogo({ className, href = "/", size = "md" }: AppLogoProps) {
	const text =
		size === "sm"
			? "text-[1rem] tracking-tight"
			: "text-[1.125rem] tracking-tight";
	const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

	const inner = (
		<span
			className={cn(
				"inline-flex items-center gap-2 font-bold font-display",
				text,
			)}
		>
			<span
				aria-hidden
				className={cn(
					"rounded-full bg-brand shadow-brand/30 shadow-lg ring-2 ring-brand/35",
					dot,
				)}
			/>
			<span className="text-foreground">CodePulse</span>
		</span>
	);

	if (href) {
		return (
			<Link
				className={cn("transition-opacity hover:opacity-90", className)}
				href={href}
			>
				{inner}
			</Link>
		);
	}

	return <span className={className}>{inner}</span>;
}
