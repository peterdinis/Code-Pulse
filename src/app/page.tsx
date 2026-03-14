import type { Metadata } from "next";
import { LandingPageClient } from "./_components/LandingPageClient";

export const metadata: Metadata = {
  title: "CodePulse — AI Code Review",
  description:
    "CodePulse connects to your GitHub repositories and delivers instant, actionable AI feedback on every pull request. Ship faster with fewer bugs.",
};

export default function HomePage() {
  return <LandingPageClient />;
}
