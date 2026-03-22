"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<div aria-hidden className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
		);
	}

	const isDark = theme === "dark";

	return (
		<button
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			type="button"
		>
			{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</button>
	);
}
