import type { Metadata } from "next";
import { HomeJsonLd } from "~/components/seo/JsonLd";
import { defaultDescription, siteName } from "~/lib/site";
import { LandingPageClient } from "./_components/LandingPageClient";

export const metadata: Metadata = {
	title: `${siteName} — AI code review for GitHub`,
	description: defaultDescription,
	openGraph: {
		title: `${siteName} — AI code review for GitHub`,
		description: defaultDescription,
	},
};

export default function HomePage() {
	return (
		<>
			<HomeJsonLd />
			<LandingPageClient />
		</>
	);
}
