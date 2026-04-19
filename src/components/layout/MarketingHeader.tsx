import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { AppLogo } from "~/components/brand/AppLogo";
import { ThemeToggle } from "~/components/ThemeToggle";
import { cn } from "~/lib/utils";

type MarketingHeaderProps = {
	backHref?: ComponentProps<typeof Link>["href"];
	backLabel?: string;
	className?: string;
	showTheme?: boolean;
};

export function MarketingHeader({
	backHref = "/",
	backLabel = "Back",
	className,
	showTheme = true,
}: MarketingHeaderProps) {
	return (
		<header
			className={cn(
				"sticky top-0 z-50 border-border/80 border-b bg-background/75 backdrop-blur-2xl",
				className,
			)}
		>
			<div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:px-8">
				<Link
					className="inline-flex max-w-[min(100%,12rem)] items-center gap-2 justify-self-start text-muted-foreground text-sm transition-colors hover:text-brand"
					href={backHref}
				>
					<ArrowLeft className="h-4 w-4 shrink-0" />
					<span className="truncate">{backLabel}</span>
				</Link>
				<AppLogo className="justify-self-center" href="/" />
				<div className="flex justify-self-end">
					{showTheme ? <ThemeToggle /> : <span className="inline-block w-9" />}
				</div>
			</div>
		</header>
	);
}
