import { defaultDescription, getSiteUrl, siteName } from "~/lib/site";

/**
 * Structured data for the marketing home page (WebSite + SoftwareApplication).
 */
export function HomeJsonLd() {
	const url = getSiteUrl();
	const data = [
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: siteName,
			url,
			description: defaultDescription,
		},
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: siteName,
			applicationCategory: "DeveloperApplication",
			operatingSystem: "Web",
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "USD",
			},
			description: defaultDescription,
			url,
		},
	];

	return (
		<script
			// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, not user-controlled HTML
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
			type="application/ld+json"
		/>
	);
}
