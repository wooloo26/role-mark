import createBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
};

const withBundleAnalyzer = createBundleAnalyzer({
	enabled: process.env.NODE_ENV === "production",
	openAnalyzer: false,
});

export default withBundleAnalyzer(nextConfig);
