"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Link from "next/link";
import { ChevronDown, Github, Globe, Box, LayoutDashboard } from "lucide-react";
import { ScrollToTop } from "~/components/ScrollToTop";
import { SignInWithGitHubButton } from "~/components/SignInWithGitHubButton";
import { ThemeToggle } from "~/components/ThemeToggle";
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
      const ease = 1 - Math.pow(1 - progress, 3);
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
  const counted = useCountUp(isFloat ? numericPart * 10 : numericPart, 1.6, inView);
  const display = isFloat ? (counted / 10).toFixed(1) + suffix : counted + suffix!;

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp as unknown as Variants}
    >
      <span className="font-syne text-3xl md:text-4xl font-extrabold text-[#00e5a0] block leading-tight">
        {display}
      </span>
      <span className="text-[10px] md:text-xs text-[#6e7681] font-mono tracking-widest uppercase mt-1">
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
      className="p-7 border border-[#1e2733] rounded-lg bg-[#0f1218] cursor-default transition-all duration-200"
      variants={cardVariant as unknown as Variants}
      whileHover={{
        y: -6,
        borderColor: "rgba(0,229,160,0.35)",
        boxShadow: "0 16px 40px rgba(0,229,160,0.08)",
      }}
    >
      <motion.div
        className="text-2xl mb-4"
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
      >
        {icon}
      </motion.div>
      <div className="font-syne text-base font-bold text-white mb-2">{title}</div>
      <p className="text-xs text-[#6e7681] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

const diffLines = [
  { n: "12", type: "ctx", code: "async function fetchUser(id) {" },
  { n: "13", type: "del", code: "  const res = await fetch(`/api/users/${id}`);" },
  { n: "13", type: "add", code: "  const res = await fetch(`/api/users/${encodeURIComponent(id)}`);" },
  { n: "14", type: "ctx", code: "  if (!res.ok) throw new Error('Not found');" },
  { n: "15", type: "ctx", code: "  return res.json();" },
  { n: "16", type: "ctx", code: "}" },
];

function GithubIcon() {
  return (
    <svg className="gh-icon w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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
  const navBg = useTransform(scrollY, [0, 60], ["rgba(10,12,15,0)", "rgba(10,12,15,0.92)"]);
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
    { icon: "⚡", title: "Instant Analysis", desc: "AI reviews your PR in seconds. No waiting, no context-switching." },
    { icon: "🔍", title: "Deep Insights", desc: "Catches bugs, anti-patterns, and security issues humans miss." },
    { icon: "🔁", title: "GitHub Native", desc: "Works directly in your existing workflow. No new tools to learn." },
    { icon: "📈", title: "Team Analytics", desc: "Track code quality trends across your entire organisation." },
  ];

  return (
    <>
      <style jsx global>{`
        :root { --bg: #0a0c0f; --green: #00e5a0; }
        body { background-color: var(--bg); color: #c9d1d9; -webkit-font-smoothing: antialiased; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .hero-glow-radial {
          background: radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%);
          filter: blur(40px);
        }
        .cta-section-radial::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,229,160,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .scanline::before {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>

      <div className="scanline overflow-x-hidden font-mono antialiased bg-[#0a0c0f] text-[#c9d1d9] leading-normal selection:bg-[#00e5a0]/30 selection:text-white">
        <motion.nav
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-10 h-14 backdrop-blur-xl border-b border-[#1e2733]"
          style={{ backgroundColor: navBg as unknown as React.CSSProperties["backgroundColor"] }}
        >
          <Link href="/" className="font-syne font-extrabold text-[1.1rem] text-white flex items-center gap-2 tracking-tight">
            <motion.span
              className="w-2 h-2 rounded-full bg-[#00e5a0] shadow-[0_0_8px_#00e5a0] animate-pulse-dot"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            CodePulse
          </Link>

          <motion.ul
            className="hidden md:flex items-center gap-8 list-none"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.li variants={fadeIn as unknown as Variants} custom={0}>
              <a href="#features" className="text-[13px] text-[#6e7681] hover:text-[#00e5a0] transition-colors tracking-wide">
                Features
              </a>
            </motion.li>
            <motion.li variants={fadeIn as unknown as Variants} custom={0.08}>
              <a href="#pricing" className="text-[13px] text-[#6e7681] hover:text-[#00e5a0] transition-colors tracking-wide">
                Pricing
              </a>
            </motion.li>
            <motion.li variants={fadeIn as unknown as Variants} custom={0.16}>
              <Link href="/docs" className="text-[13px] text-[#6e7681] hover:text-[#00e5a0] transition-colors tracking-wide">
                Docs
              </Link>
            </motion.li>
          </motion.ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavAuthActions />
          </div>
        </motion.nav>

        <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center px-5 md:px-10 pt-24 pb-16 max-w-[1200px] mx-auto relative">
          <motion.div
            className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full hero-glow-radial pointer-events-none"
            style={{ y: heroGlowYSpring }}
          />
          <div className="relative z-10">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 border border-[#00e5a0]/30 rounded bg-[#00e5a0]/10 text-[10px] md:text-[11px] text-[#00e5a0] uppercase tracking-widest mb-7"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] shadow-[0_0_6px_#00e5a0] animate-pulse-dot" />
              Now in public beta
            </motion.div>
            <motion.h1
              className="font-syne text-[clamp(2.4rem,5vw,3.6rem)] font-extrabold leading-[1.05] text-white mb-2 tracking-tighter"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Code review,<br />reinvented.
            </motion.h1>
            <motion.div
              className="text-[clamp(1rem,2.5vw,1.4rem)] text-[#00e5a0] font-normal mb-7 min-h-[2rem]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              $ {typed}
              <span
                className="inline-block w-[3px] h-[1.1em] bg-[#00e5a0] ml-[2px] align-text-bottom"
                style={{ opacity: cursorVisible ? 1 : 0, transition: "opacity 0.1s" }}
              />
            </motion.div>
            <motion.p
              className="text-[13px] md:text-[15px] leading-relaxed text-[#6e7681] max-w-[460px] mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              CodePulse connects to your GitHub repositories and delivers instant, actionable AI feedback on every pull request — so your team ships faster with fewer bugs.
            </motion.p>
            <motion.div className="flex flex-wrap gap-4" initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeUp as unknown as Variants} custom={0.4}>
                <SignInWithGitHubButton className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-[#0a0c0f] rounded-md text-[13px] md:text-[14px] font-bold transition-all duration-150 shadow-none hover:shadow-[0_6px_24px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97]">
                  <Github className="w-5 h-5" />
                  Continue with GitHub
                </SignInWithGitHubButton>
              </motion.div>
              <motion.a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-[#6e7681] border border-[#1e2733] rounded-md text-[13px] md:text-[14px] transition-all hover:border-[#00e5a0] hover:text-[#00e5a0]"
                variants={fadeUp as unknown as Variants}
                custom={0.5}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                See how it works →
              </motion.a>
            </motion.div>
          </div>

          <motion.div
            className="hidden lg:block relative"
            initial={{ opacity: 0, x: 40, rotateY: 4 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.015, transition: { duration: 0.3 } }}
          >
            <div className="bg-[#0f1218] border border-[#1e2733] rounded-xl overflow-hidden shadow-[0_0_0_1px_#1e2733,0_32px_64px_rgba(0,0,0,0.5),0_0_80px_rgba(0,229,160,0.04)]">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#151b24] border-b border-[#1e2733]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="mx-auto text-[11px] text-[#6e7681] tracking-wide">codepulse — review #142</div>
              </div>
              <div className="p-6 text-[12px] md:text-[13px] leading-[1.8]">
                <AnimatePresence>
                  {terminalReady &&
                    diffLines.map((line, i) => (
                      <motion.div
                        key={i}
                        className="flex gap-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.28, delay: 0.7 + i * 0.07, ease: "easeOut" }}
                      >
                        <span className="text-[#3d4b5c] select-none min-w-[1.5rem] text-right">{line.n}</span>
                        <span className={line.type === "add" ? "text-[#00e5a0]" : line.type === "del" ? "text-[#ff7b7b] line-through opacity-60" : "text-[#6e7681]"}>
                          {line.type === "add" ? "+ " : line.type === "del" ? "- " : "  "}
                          {line.code}
                        </span>
                      </motion.div>
                    ))}
                </AnimatePresence>
                <motion.div
                  className="mt-4 p-4 border-l-2 border-[#00e5a0] bg-[#00e5a0]/10 rounded-r-lg text-[12px] leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.65, ease: "easeOut" }}
                >
                  <div className="text-[#00e5a0] font-bold text-[11px] uppercase tracking-widest mb-1.5">▸ CodePulse AI</div>
                  <p className="text-[#c9d1d9]">
                    Security: the raw <code className="text-[#f5a623] px-1">id</code> parameter was interpolated directly into the URL, enabling path traversal. Wrapping it with <code className="text-[#00e5a0] px-1">encodeURIComponent()</code> sanitises the input.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        <div className="border-y border-[#1e2733] py-8 px-5 bg-[#0f1218] flex flex-wrap justify-center gap-10 lg:gap-24">
          <StatItem num="12k+" label="Pull Requests Reviewed" />
          <StatItem num="340+" label="Teams Using CodePulse" />
          <StatItem num="94%" label="Bug Detection Rate" />
        </div>

        <section className="max-w-[1100px] mx-auto px-5 md:px-10 py-24" id="features">
          <motion.p
            className="text-[11px] text-[#00e5a0] uppercase tracking-[0.2em] mb-3"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            // why codepulse
          </motion.p>
          <motion.h2
            className="font-syne text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-white mb-12 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            Everything your team needs.
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </motion.div>
        </section>

        <motion.section
          className="mx-5 md:mx-10 mb-24 p-10 md:p-16 border border-[#1e2733] rounded-2xl bg-[#0f1218] text-center relative overflow-hidden cta-section-radial"
          id="pricing"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p className="text-[11px] text-[#00e5a0] uppercase tracking-[0.2em] mb-4 relative z-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            get started
          </motion.p>
          <motion.h2
            className="font-syne text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-white mb-4 relative z-10 tracking-tight"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            Ship better code today.
          </motion.h2>
          <motion.p className="text-[14px] md:text-base text-[#6e7681] leading-relaxed max-w-[500px] mx-auto mb-10 relative z-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.25 }}>
            Free for open-source projects. No credit card required. Connect your GitHub account and your first review happens in under 60 seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.35, type: "spring", stiffness: 200 }}
            className="relative z-10"
          >
            <SignInWithGitHubButton className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-[#0a0c0f] rounded-lg text-sm md:text-base font-bold transition-all duration-300 shadow-none hover:shadow-[0_8px_28px_rgba(255,255,255,0.18)] hover:scale-105 active:scale-[0.97]">
              <GithubIcon />
              Start Free with GitHub
            </SignInWithGitHubButton>
          </motion.div>
        </motion.section>

        <motion.footer
          className="border-t border-[#1e2733] py-8 px-5 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-[#6e7681]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span>© {new Date().getFullYear()} CodePulse</span>
          <nav className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/docs" className="hover:text-[#00e5a0] transition-colors">Docs</Link>
            <a href="/#pricing" className="hover:text-[#00e5a0] transition-colors">Pricing</a>
            <Link href="/signup" className="hover:text-[#00e5a0] transition-colors">Sign up</Link>
          </nav>
          <span>Built with ♥ for developers</span>
        </motion.footer>
        <ScrollToTop />
      </div>
    </>
  );
}

function NavAuthActions() {
  const { data: session, isPending } = useSession();
  if (isPending) {
    return <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-md text-[13px] text-[#6e7681] animate-pulse">…</div>;
  }
  if (session?.user) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2.5 px-4 py-2 bg-white text-[#0a0c0f] rounded-md text-[13px] font-bold transition-all hover:scale-105 active:scale-[0.97] hover:shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
      >
        <LayoutDashboard className="w-4 h-4" />
        Go to dashboard
      </Link>
    );
  }
  return <SignInDropdown />;
}

function SignInDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2.5 px-4 py-2 bg-white text-[#0a0c0f] rounded-md text-[13px] font-bold transition-all hover:scale-105 active:scale-[0.97]">
        <GithubIcon />
        Sign in
        <ChevronDown className="w-4 h-4 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] bg-[#0f1218] border-[#1e2733] text-[#c9d1d9] rounded-xl shadow-2xl p-1.5 focus:outline-none">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2 text-[10px] text-[#6e7681] uppercase tracking-widest font-mono">
            Sign in with
          </DropdownMenuLabel>
          <DropdownMenuItem className="focus:bg-[#151b24] focus:text-white rounded-lg transition-colors cursor-pointer outline-none p-0">
            <SignInWithGitHubButton className="flex items-center gap-3 px-3 py-2.5 group w-full text-left bg-transparent border-none cursor-pointer">
              <div className="w-7 h-7 bg-[#24292e] rounded-md flex items-center justify-center shrink-0">
                <GithubIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-white">GitHub</span>
                <span className="text-[10px] text-[#6e7681]">github.com</span>
              </div>
            </SignInWithGitHubButton>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-[#151b24] focus:text-white rounded-lg transition-colors cursor-pointer outline-none p-0">
            <Link href="/signup" className="flex items-center gap-3 px-3 py-2.5 group w-full">
              <div className="w-7 h-7 bg-[#fc6d26] rounded-md flex items-center justify-center">
                <Box className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-white">GitLab</span>
                <span className="text-[10px] text-[#6e7681]">Coming soon</span>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-[#151b24] focus:text-white rounded-lg transition-colors cursor-pointer outline-none p-0">
            <Link href="/signup" className="flex items-center gap-3 px-3 py-2.5 group w-full">
              <div className="w-7 h-7 bg-[#0052cc] rounded-md flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-white">Bitbucket</span>
                <span className="text-[10px] text-[#6e7681]">Coming soon</span>
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="h-px bg-[#1e2733] my-1" />
        <div className="px-3 py-2 text-[10px] text-center text-[#6e7681]">
          No account? <Link href="/signup" className="text-[#00e5a0] hover:underline">Sign up free</Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
