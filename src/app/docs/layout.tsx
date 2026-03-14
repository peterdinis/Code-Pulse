import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Docs — CodePulse",
	description:
		"CodePulse documentation: get started, AI review, GitHub integration, and API keys.",
};

export default function DocsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
