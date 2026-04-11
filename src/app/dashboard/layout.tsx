import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingScreen } from "~/components/LoadingScreen";

export const metadata: Metadata = {
	title: "Dashboard",
	robots: { index: false, follow: false },
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Suspense fallback={<LoadingScreen label="Loading dashboard…" />}>
			{children}
		</Suspense>
	);
}
