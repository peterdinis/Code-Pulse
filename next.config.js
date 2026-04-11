import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	typedRoutes: true,
	transpilePackages: ["lucide-react", "framer-motion", "next-themes"],
};

export default config;
