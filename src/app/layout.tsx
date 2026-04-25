import "~/styles/globals.css";
import type { Metadata } from "next";
import { Geist, Inter, Syne } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { LoadingScreen } from "~/components/LoadingScreen";
import { ThemeProvider } from "~/components/ThemeProvider";
import { getDefaultMetadata } from "~/lib/site";
import { cn } from "~/lib/utils";
import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	...getDefaultMetadata(),
	icons: [{ rel: "icon", url: "/favicon.ico" }],
	appleWebApp: {
		title: "CodePulse",
	},
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const fontDisplay = Syne({
	subsets: ["latin"],
	variable: "--font-syne",
	weight: ["600", "700", "800"],
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			className={cn(
				geist.variable,
				inter.variable,
				fontDisplay.variable,
				"font-sans",
			)}
			lang="en"
			suppressHydrationWarning
		>
			<body suppressHydrationWarning>
				<TRPCReactProvider>
					<ThemeProvider>
						<Suspense fallback={<LoadingScreen label="Loading…" />}>
							{children}
						</Suspense>
						<Toaster position="top-right" richColors />
					</ThemeProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
