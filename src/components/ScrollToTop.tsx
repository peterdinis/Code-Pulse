"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function ScrollToTop() {
	const [isVisible, setIsVisible] = useState(false);

	// Show button when page is scrolled down
	const toggleVisibility = useCallback(() => {
		if (window.pageYOffset > 300) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	}, []);

	// Set the top scroll position
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	useEffect(() => {
		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, [toggleVisibility]);

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.button
					animate={{ opacity: 1, scale: 1 }}
					aria-label="Scroll to top"
					className="fixed right-8 bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-brand/30 shadow-lg transition-transform hover:scale-110 hover:shadow-xl active:scale-95 md:h-14 md:w-14"
					exit={{ opacity: 0, scale: 0.5 }}
					initial={{ opacity: 0, scale: 0.5 }}
					onClick={scrollToTop}
				>
					<ChevronUp className="h-6 w-6 md:h-7 md:w-7" />
				</motion.button>
			)}
		</AnimatePresence>
	);
}
