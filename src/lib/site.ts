import type { Metadata } from "next";

export const siteName = "CodePulse";

export const defaultDescription =
	"Connect CodePulse to your GitHub repositories for instant, actionable AI feedback on every pull request. ChatGPT & Gemini support.";

/** Canonical site URL for metadata, OG tags, and sitemap. Set NEXT_PUBLIC_APP_URL in production. */
export function getSiteUrl(): string {
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
	}
	if (process.env.VERCEL_URL) {
		const v = process.env.VERCEL_URL;
		return v.startsWith("http")
			? v.replace(/\/$/, "")
			: `https://${v.replace(/\/$/, "")}`;
	}
	return "http://localhost:3000";
}

export function getMetadataBase(): URL {
	return new URL(`${getSiteUrl()}/`);
}

const keywords = [
	"AI code review",
	"GitHub",
	"pull request",
	"code quality",
	"CodePulse",
	"OpenAI",
	"Gemini",
	"developer tools",
];

/** Shared defaults merged into root layout and pages. */
export function getDefaultMetadata(): Metadata {
	const base = getSiteUrl();
	return {
		metadataBase: getMetadataBase(),
		title: {
			default: `${siteName} — AI code review for GitHub`,
			template: `%s | ${siteName}`,
		},
		description: defaultDescription,
		keywords,
		authors: [{ name: siteName }],
		creator: siteName,
		openGraph: {
			type: "website",
			locale: "en_US",
			url: base,
			siteName,
			title: `${siteName} — AI code review for GitHub`,
			description: defaultDescription,
		},
		twitter: {
			card: "summary_large_image",
			title: `${siteName} — AI code review for GitHub`,
			description: defaultDescription,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
			},
		},
		alternates: {
			canonical: base,
		},
	};
}
