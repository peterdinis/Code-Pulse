/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	typedRoutes: true,
	experimental: {
		optimizeCss: true,
	},
	transpilePackages: ["lucide-react", "framer-motion", "next-themes"],
};

export default config;
