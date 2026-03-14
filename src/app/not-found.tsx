"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, SearchX } from "lucide-react";
import { cn } from "~/lib/utils";

const container = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.12,
			delayChildren: 0.08,
		},
	},
};

const item = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
	},
};

const float = {
	animate: {
		y: [0, -8, 0],
		transition: {
			duration: 3,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
};

const pulse = {
	animate: {
		scale: [1, 1.05, 1],
		opacity: [0.4, 0.7, 0.4],
		transition: {
			duration: 2.5,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
};

export default function NotFound() {
	return (
		<div
			className={cn(
				"min-h-screen flex flex-col items-center justify-center px-6",
				"bg-background text-foreground",
			)}
		>
			{/* Decorative background blob */}
			<motion.div
				className="pointer-events-none absolute inset-0 overflow-hidden"
				initial="hidden"
				animate="visible"
				variants={container}
			>
				<motion.div
					className="absolute -left-1/4 top-1/3 h-96 w-96 rounded-full bg-[#00e5a0]/10 blur-3xl"
					variants={pulse}
					animate="animate"
				/>
				<motion.div
					className="absolute -right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-[#00e5a0]/5 blur-3xl"
					variants={pulse}
					animate="animate"
					style={{ transitionDelay: "0.5s" }}
				/>
			</motion.div>

			<motion.div
				className="relative z-10 flex max-w-md flex-col items-center text-center"
				variants={container}
				initial="hidden"
				animate="visible"
			>
				{/* Icon */}
				<motion.div
					className="mb-6 flex size-24 items-center justify-center rounded-2xl border border-border/50 bg-muted/50"
					variants={item}
				>
					<motion.div variants={float} animate="animate">
						<SearchX className="size-12 text-[#00e5a0]" strokeWidth={1.5} />
					</motion.div>
				</motion.div>

				{/* 404 */}
				<motion.h1
					className="font-mono text-7xl font-bold tracking-tighter text-foreground sm:text-8xl"
					variants={item}
				>
					404
				</motion.h1>

				<motion.p
					className="mt-3 text-lg text-muted-foreground sm:text-xl"
					variants={item}
				>
					Page not found
				</motion.p>

				<motion.p
					className="mt-2 max-w-sm text-sm text-muted-foreground/80"
					variants={item}
				>
					The page you’re looking for doesn’t exist or has been moved.
				</motion.p>

				<motion.div className="mt-10" variants={item}>
					<Link
						href="/"
						className={cn(
							"inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold",
							"bg-[#00e5a0] text-black transition-colors hover:bg-[#00e5a0]/90",
							"dark:bg-[#00e5a0] dark:text-black dark:hover:bg-[#00e5a0]/90",
						)}
					>
						<Home className="size-4" />
						Back to home
					</Link>
				</motion.div>
			</motion.div>
		</div>
	);
}
