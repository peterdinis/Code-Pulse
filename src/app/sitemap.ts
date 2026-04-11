import type { MetadataRoute } from "next";

import { getSiteUrl } from "~/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
	const base = getSiteUrl();
	const lastModified = new Date();

	const routes = ["", "/docs", "/signup"].map((path) => ({
		url: `${base}${path}`,
		lastModified,
		changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
		priority: path === "" ? 1 : 0.8,
	}));

	return routes;
}
