import { Suspense } from "react";
import { LoadingScreen } from "~/components/LoadingScreen";

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
