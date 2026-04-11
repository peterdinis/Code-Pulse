import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Documentation",
	description:
		"CodePulse documentation: GitHub sign-in, AI providers, API keys, PR reviews, and dashboard workflows.",
	openGraph: {
		title: "Documentation — CodePulse",
		description:
			"Get started with CodePulse: AI-powered reviews, OpenAI & Gemini, and GitHub integration.",
	},
};

export default function DocsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
