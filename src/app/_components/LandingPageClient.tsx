"use client";

import {
	AnimatePresence,
	motion,
	useInView,
	useScroll,
	useSpring,
	useTransform,
	type Variants,
} from "framer-motion";
import { ChevronDown, Github, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollToTop } from "~/components/ScrollToTop";
import { SignInWithGitHubButton } from "~/components/SignInWithGitHubButton";
import { ThemeToggle } from "~/components/ThemeToggle";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useSession } from "~/lib/client";

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: (delay = 0) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
	}),
};

const fadeIn = {
	hidden: { opacity: 0 },
	visible: (delay = 0) => ({
		opacity: 1,
		transition: { duration: 0.5, ease: "easeOut", delay },
	}),
};

const staggerContainer = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
	hidden: { opacity: 0, y: 24, scale: 0.97 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
	},
};

function useCountUp(target: number, duration = 1.8, start = false) {
	const [value, setValue] = useState(0);
	useEffect(() => {
		if (!start) return;
		let startTime: number | null = null;
		const step = (ts: number) => {
			if (!startTime) startTime = ts;
			const progress = Math.min((ts - startTime) / (duration * 1000), 1);
			const ease = 1 - (1 - progress) ** 3;
			setValue(Math.floor(ease * target));
			if (progress < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}, [start, target, duration]);
	return value;
}

function StatItem({ num, label }: { num: string; label: string }) {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: "-60px" });
	const match = num.match(/^([\d.]+)(.*)$/);
	const numericPart = match ? parseFloat(match[1]!) : 0;
	const suffix = match ? match[2] : num;
	const isFloat = match ? match[1]!.includes(".") : false;
	const counted = useCountUp(
		isFloat ? numericPart * 10 : numericPart,
		1.6,
		inView,
	);
	const display = isFloat
		? (counted / 10).toFixed(1) + suffix
		: counted + suffix!;

	return (
		<motion.div
			animate={inView ? "visible" : "hidden"}
			className="flex flex-col items-center text-center"
			initial="hidden"
			ref={ref}
			variants={fadeUp as unknown as Variants}
		>
			<span className="block font-extrabold font-syne text-3xl text-[#00e5a0] leading-tight md:text-4xl">
				{display}
			</span>
			<span className="mt-1 font-mono text-[10px] text-muted-foreground uppercase tracking-widest md:text-xs">
				{label}
			</span>
		</motion.div>
	);
}

function FeatureCard({
	icon,
	title,
	desc,
}: {
	icon: string;
	title: string;
	desc: string;
}) {
	return (
		<motion.div
			className="cursor-default rounded-lg border border-border bg-card p-7 shadow-sm transition-all duration-200 dark:shadow-none"
			variants={cardVariant as unknown as Variants}
			whileHover={{
				y: -6,
				borderColor: "rgba(0,229,160,0.35)",
				boxShadow: "0 16px 40px rgba(0,229,160,0.08)",
			}}
		>
			<motion.div
				className="mb-4 text-2xl"
				initial={{ scale: 0.5, opacity: 0 }}
				transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
				viewport={{ once: true }}
				whileInView={{ scale: 1, opacity: 1 }}
			>
				{icon}
			</motion.div>
			<div className="mb-2 font-bold font-syne text-base text-foreground">
				{title}
			</div>
			<p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
		</motion.div>
	);
}

const diffLines = [
	{ n: "12", type: "ctx", code: "async function fetchUser(id) {" },
	{
		n: "13",
		type: "del",
		code: "  const res = await fetch(`/api/users/${id}`);",
	},
	{
		n: "13",
		type: "add",
		code: "  const res = await fetch(`/api/users/${encodeURIComponent(id)}`);",
	},
	{
		n: "14",
		type: "ctx",
		code: "  if (!res.ok) throw new Error('Not found');",
	},
	{ n: "15", type: "ctx", code: "  return res.json();" },
	{ n: "16", type: "ctx", code: "}" },
];

function GithubIcon() {
	return (
		<svg
			className="gh-icon h-5 w-5"
			fill="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
		</svg>
	);
}

export function LandingPageClient() {
	const [typed, setTyped] = useState("");
	const [cursorVisible, setCursorVisible] = useState(true);
	const [terminalReady, setTerminalReady] = useState(false);
	const fullText = "ai-powered code review";

	const { scrollY } = useScroll();
	const heroGlowY = useTransform(scrollY, [0, 400], [0, 80]);
	const heroGlowYSpring = useSpring(heroGlowY, { stiffness: 80, damping: 20 });

	useEffect(() => {
		const delay = setTimeout(() => {
			let i = 0;
			const interval = setInterval(() => {
				if (i <= fullText.length) {
					setTyped(fullText.slice(0, i));
					i++;
				} else clearInterval(interval);
			}, 55);
			return () => clearInterval(interval);
		}, 800);
		return () => clearTimeout(delay);
	}, []);

	useEffect(() => {
		const blink = setInterval(() => setCursorVisible((v) => !v), 530);
		return () => clearInterval(blink);
	}, []);

	useEffect(() => {
		const t = setTimeout(() => setTerminalReady(true), 400);
		return () => clearTimeout(t);
	}, []);

	const features = [
		{
			icon: "⚡",
			title: "Instant Analysis",
			desc: "AI reviews your PR in seconds. No waiting, no context-switching.",
		},
		{
			icon: "🔍",
			title: "Deep Insights",
			desc: "Catches bugs, anti-patterns, and security issues humans miss.",
		},
		{
			icon: "🔁",
			title: "GitHub Native",
			desc: "Works directly in your existing workflow. No new tools to learn.",
		},
		{
			icon: "📈",
			title: "Team Analytics",
			desc: "Track code quality trends across your entire organisation.",
		},
	];

	return (
		<div className="scanline overflow-x-hidden bg-background font-mono text-foreground leading-normal antialiased selection:bg-[#00e5a0]/30 dark:selection:text-white">
			<motion.nav className="fixed top-0 right-0 left-0 z-100 flex h-14 items-center justify-between border-border border-b bg-background/80 px-5 backdrop-blur-xl md:px-10 dark:bg-background/85">
				<Link
					className="flex items-center gap-2 font-extrabold font-syne text-[1.1rem] text-foreground tracking-tight"
					href="/"
				>
					<motion.span
						animate={{ opacity: 1, x: 0 }}
						className="h-2 w-2 animate-pulse-dot rounded-full bg-[#00e5a0] shadow-[0_0_8px_#00e5a0]"
						initial={{ opacity: 0, x: -16 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					/>
					CodePulse
				</Link>

				<motion.ul
					animate="visible"
					className="hidden list-none items-center gap-8 md:flex"
					initial="hidden"
					variants={staggerContainer}
				>
					<motion.li custom={0} variants={fadeIn as unknown as Variants}>
						<a
							className="text-[13px] text-muted-foreground tracking-wide transition-colors hover:text-[#00e5a0]"
							href="#features"
						>
							Features
						</a>
					</motion.li>
					<motion.li custom={0.08} variants={fadeIn as unknown as Variants}>
						<Link
							className="text-[13px] text-muted-foreground tracking-wide transition-colors hover:text-[#00e5a0]"
							href="/docs"
						>
							Docs
						</Link>
					</motion.li>
				</motion.ul>

				<div className="flex items-center gap-2">
					<ThemeToggle />
					<NavAuthActions />
				</div>
			</motion.nav>

			<section className="relative mx-auto grid min-h-screen max-w-300 grid-cols-1 items-center gap-10 px-5 pt-24 pb-16 md:px-10 lg:grid-cols-2 lg:gap-16">
				<motion.div
					className="hero-glow-radial pointer-events-none absolute top-[20%] -left-[10%] h-150 w-150 rounded-full"
					style={{ y: heroGlowYSpring }}
				/>
				<div className="relative z-10">
					<motion.div
						animate={{ opacity: 1, y: 0, scale: 1 }}
						className="mb-7 inline-flex items-center gap-2 rounded border border-[#00e5a0]/30 bg-[#00e5a0]/10 px-3 py-1 text-[#00e5a0] text-[10px] uppercase tracking-widest md:text-[11px]"
						initial={{ opacity: 0, y: 16, scale: 0.95 }}
						transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					>
						<span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#00e5a0] shadow-[0_0_6px_#00e5a0]" />
						Now in public beta
					</motion.div>
					<motion.h1
						animate={{ opacity: 1, y: 0 }}
						className="mb-2 font-extrabold font-syne text-[clamp(2.4rem,5vw,3.6rem)] text-foreground leading-[1.05] tracking-tighter"
						initial={{ opacity: 0, y: 24 }}
						transition={{
							duration: 0.65,
							delay: 0.1,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						Code review,
						<br />
						reinvented.
					</motion.h1>
					<motion.div
						animate={{ opacity: 1 }}
						className="mb-7 min-h-8 font-normal text-[#00e5a0] text-[clamp(1rem,2.5vw,1.4rem)]"
						initial={{ opacity: 0 }}
						transition={{ duration: 0.4, delay: 0.5 }}
					>
						$ {typed}
						<span
							className="ml-0.5 inline-block h-[1.1em] w-0.75 bg-[#00e5a0] align-text-bottom"
							style={{
								opacity: cursorVisible ? 1 : 0,
								transition: "opacity 0.1s",
							}}
						/>
					</motion.div>
					<motion.p
						animate={{ opacity: 1, y: 0 }}
						className="mb-10 max-w-115 text-[13px] text-muted-foreground leading-relaxed md:text-[15px]"
						initial={{ opacity: 0, y: 16 }}
						transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
					>
						CodePulse connects to your GitHub repositories and delivers instant,
						actionable AI feedback on every pull request — so your team ships
						faster with fewer bugs.
					</motion.p>
					<motion.div
						animate="visible"
						className="flex flex-wrap gap-4"
						initial="hidden"
						variants={staggerContainer}
					>
						<motion.div custom={0.4} variants={fadeUp as unknown as Variants}>
							<SignInWithGitHubButton className="inline-flex items-center gap-2.5 rounded-md bg-white px-6 py-3 font-bold text-[#0a0c0f] text-[13px] shadow-none transition-all duration-150 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(255,255,255,0.15)] active:scale-[0.97] md:text-[14px]">
								<Github className="h-5 w-5" />
								Continue with GitHub
							</SignInWithGitHubButton>
						</motion.div>
						<motion.a
							className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-6 py-3 text-[13px] text-muted-foreground transition-all hover:border-[#00e5a0] hover:text-[#00e5a0] md:text-[14px]"
							custom={0.5}
							href="#features"
							variants={fadeUp as unknown as Variants}
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
						>
							See how it works →
						</motion.a>
					</motion.div>
				</div>

				<motion.div
					animate={{ opacity: 1, x: 0, rotateY: 0 }}
					className="relative hidden lg:block"
					initial={{ opacity: 0, x: 40, rotateY: 4 }}
					transition={{
						duration: 0.8,
						delay: 0.35,
						ease: [0.22, 1, 0.36, 1],
					}}
					whileHover={{ scale: 1.015, transition: { duration: 0.3 } }}
				>
					<div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_32px_64px_rgba(0,0,0,0.12)] dark:shadow-[0_0_0_1px_oklch(0.28_0.025_250),0_32px_64px_rgba(0,0,0,0.5),0_0_80px_rgba(0,229,160,0.04)]">
						<div className="flex items-center gap-2 border-border border-b bg-muted px-4 py-3">
							<div className="flex gap-1.5">
								<div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
								<div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
								<div className="h-3 w-3 rounded-full bg-[#27c93f]" />
							</div>
							<div className="mx-auto text-[11px] text-muted-foreground tracking-wide">
								codepulse — review #142
							</div>
						</div>
						<div className="p-6 text-[12px] leading-[1.8] md:text-[13px]">
							<AnimatePresence>
								{terminalReady &&
									diffLines.map((line, i) => (
										<motion.div
											animate={{ opacity: 1, x: 0 }}
											className="flex gap-4"
											initial={{ opacity: 0, x: -10 }}
											key={i}
											transition={{
												duration: 0.28,
												delay: 0.7 + i * 0.07,
												ease: "easeOut",
											}}
										>
											<span className="min-w-6 select-none text-right text-muted-foreground/60">
												{line.n}
											</span>
											<span
												className={
													line.type === "add"
														? "text-[#00e5a0]"
														: line.type === "del"
															? "text-[#ff7b7b] line-through opacity-60"
															: "text-muted-foreground"
												}
											>
												{line.type === "add"
													? "+ "
													: line.type === "del"
														? "- "
														: "  "}
												{line.code}
											</span>
										</motion.div>
									))}
							</AnimatePresence>
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								className="mt-4 rounded-r-lg border-[#00e5a0] border-l-2 bg-[#00e5a0]/10 p-4 text-[12px] leading-relaxed"
								initial={{ opacity: 0, y: 10 }}
								transition={{ duration: 0.5, delay: 1.65, ease: "easeOut" }}
							>
								<div className="mb-1.5 font-bold text-[#00e5a0] text-[11px] uppercase tracking-widest">
									▸ CodePulse AI
								</div>
								<p className="text-foreground/90">
									Security: the raw{" "}
									<code className="px-1 text-[#f5a623]">id</code> parameter was
									interpolated directly into the URL, enabling path traversal.
									Wrapping it with{" "}
									<code className="px-1 text-[#00e5a0]">
										encodeURIComponent()
									</code>{" "}
									sanitises the input.
								</p>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</section>

			<div className="flex flex-wrap justify-center gap-10 border-border border-y bg-muted/40 px-5 py-8 lg:gap-24">
				<StatItem label="Pull Requests Reviewed" num="12k+" />
				<StatItem label="Teams Using CodePulse" num="340+" />
				<StatItem label="Bug Detection Rate" num="94%" />
			</div>

			<section className="mx-auto max-w-275 px-5 py-24 md:px-10" id="features">
				<motion.p
					className="mb-3 text-[#00e5a0] text-[11px] uppercase tracking-[0.2em]"
					initial={{ opacity: 0, x: -12 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					viewport={{ once: true, margin: "-80px" }}
					whileInView={{ opacity: 1, x: 0 }}
				>
					{"// why codepulse"}
				</motion.p>
				<motion.h2
					className="mb-12 font-extrabold font-syne text-[clamp(1.8rem,4vw,2.5rem)] text-foreground tracking-tight"
					initial={{ opacity: 0, y: 20 }}
					transition={{
						duration: 0.55,
						delay: 0.08,
						ease: [0.22, 1, 0.36, 1],
					}}
					viewport={{ once: true, margin: "-80px" }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					Everything your team needs.
				</motion.h2>
				<motion.div
					className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
					initial="hidden"
					variants={staggerContainer}
					viewport={{ once: true, margin: "-60px" }}
					whileInView="visible"
				>
					{features.map((f) => (
						<FeatureCard key={f.title} {...f} />
					))}
				</motion.div>
			</section>

			<motion.footer
				className="flex flex-col items-center justify-between gap-4 border-border border-t px-5 py-8 text-[12px] text-muted-foreground md:flex-row md:px-10"
				initial={{ opacity: 0 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
				whileInView={{ opacity: 1 }}
			>
				<span>© {new Date().getFullYear()} CodePulse</span>
				<nav className="flex flex-wrap items-center justify-center gap-4">
					<Link className="transition-colors hover:text-[#00e5a0]" href="/docs">
						Docs
					</Link>
					<Link
						className="transition-colors hover:text-[#00e5a0]"
						href="/signup"
					>
						Sign up
					</Link>
				</nav>
				<span>Built with ♥ for developers</span>
			</motion.footer>
			<ScrollToTop />
		</div>
	);
}

function NavAuthActions() {
	const { data: session, isPending } = useSession();
	if (isPending) {
		return (
			<div className="inline-flex animate-pulse items-center gap-2.5 rounded-md px-4 py-2 text-[13px] text-muted-foreground">
				…
			</div>
		);
	}
	if (session?.user) {
		return (
			<Link
				className="inline-flex items-center gap-2.5 rounded-md bg-white px-4 py-2 font-bold text-[#0a0c0f] text-[13px] transition-all hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,255,255,0.12)] active:scale-[0.97]"
				href="/dashboard"
			>
				<LayoutDashboard className="h-4 w-4" />
				Go to dashboard
			</Link>
		);
	}
	return <SignInDropdown />;
}

function SignInDropdown() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="inline-flex items-center gap-2.5 rounded-md bg-white px-4 py-2 font-bold text-[#0a0c0f] text-[13px] transition-all hover:scale-105 active:scale-[0.97]">
				<GithubIcon />
				Sign in
				<ChevronDown className="h-4 w-4 opacity-50" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-60 rounded-xl border-border bg-popover p-1.5 text-popover-foreground shadow-2xl focus:outline-none"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className="px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
						Sign in with
					</DropdownMenuLabel>
					<DropdownMenuItem className="cursor-pointer rounded-lg p-0 outline-none transition-colors focus:bg-accent focus:text-accent-foreground">
						<SignInWithGitHubButton className="group flex w-full cursor-pointer items-center gap-3 border-none bg-transparent px-3 py-2.5 text-left">
							<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#24292e]">
								<GithubIcon />
							</div>
							<div className="flex flex-col">
								<span className="font-semibold text-[13px] text-foreground">
									GitHub
								</span>
								<span className="text-[10px] text-muted-foreground">
									github.com
								</span>
							</div>
						</SignInWithGitHubButton>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator className="my-1 h-px bg-border" />
				<div className="px-3 py-2 text-center text-[10px] text-muted-foreground">
					No account?{" "}
					<Link className="text-[#00e5a0] hover:underline" href="/signup">
						Sign up free
					</Link>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
