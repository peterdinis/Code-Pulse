"use client";

import { Bell, Trash, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { AnimatePresence, motion } from "framer-motion";

export function NotificationBell({ userId }: { userId: string }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { data: notifications } = api.notification.list.useQuery(
		{ userId },
		{ enabled: open },
	);
	const { data: unreadCount } = api.notification.unreadCount.useQuery({
		userId,
	});
	const utils = api.useUtils();
	const markRead = api.notification.markRead.useMutation({
		onSuccess: () => {
			utils.notification.list.invalidate();
			utils.notification.unreadCount.invalidate();
			toast.success("Notification marked as read");
		},
	});
	const markAllRead = api.notification.markAllRead.useMutation({
		onSuccess: () => {
			utils.notification.list.invalidate();
			utils.notification.unreadCount.invalidate();
			toast.success("All notifications marked as read");
		},
	});

	const removeNotificationById = api.notification.removeById.useMutation({
		onSuccess: () => {
			utils.notification.list.invalidate();
			utils.notification.unreadCount.invalidate();
			toast.success("Notification removed");
		},
	});

	const removeAllNotifications = api.notification.cleanAllNotifications.useMutation({
		onSuccess: () => {
			utils.notification.list.invalidate();
			utils.notification.unreadCount.invalidate();
			toast.success("All notifications removed");
		},
	});

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node))
				setOpen(false);
		}
		if (open) document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [open]);

	const list = notifications ?? [];
	const hasUnread = (unreadCount ?? 0) > 0;

	// Animácia pre košík
	const [isCleaning, setIsCleaning] = useState(false);

	const handleCleanAll = async () => {
		setIsCleaning(true);
		setTimeout(async () => {
			await removeAllNotifications.mutate({ userId });
			setIsCleaning(false);
		}, 300);
	};

	return (
		<div className="relative z-120" ref={ref}>
			<button
				aria-label="Notifications"
				className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				onClick={() => setOpen((o) => !o)}
				type="button"
			>
				<motion.div
					animate={hasUnread ? {
						scale: [1, 1.2, 1],
						rotate: [0, 15, -15, 0],
					} : {}}
					transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
				>
					<Bell className="h-5 w-5" />
				</motion.div>
				{hasUnread && (
					<motion.span
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"
					/>
				)}
			</button>
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="absolute top-full right-0 z-130 mt-1 flex max-h-100 w-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl"
					>
						<div className="flex items-center justify-between border-border border-b p-3">
							<span className="font-semibold text-foreground text-sm">
								Notifications
							</span>
							<div className="flex items-center gap-2">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									animate={isCleaning ? {
										rotate: [0, -15, 15, -15, 15, 0],
										scale: [1, 1.1, 1],
									} : {}}
									transition={{ duration: 0.5 }}
									onClick={handleCleanAll}
									type="button"
									className="text-muted-foreground hover:text-destructive transition-colors"
								>
									<Trash2 className="h-4 w-4" />
								</motion.button>
								{hasUnread && (
									<button
										className="text-primary text-xs hover:underline transition-colors"
										onClick={() => markAllRead.mutate({ userId })}
										type="button"
									>
										Mark all read
									</button>
								)}
							</div>
						</div>
						<div className="flex-1 overflow-y-auto">
							<AnimatePresence mode="popLayout">
								{list.length === 0 ? (
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="p-4 text-center text-muted-foreground text-sm"
									>
										No notifications
									</motion.p>
								) : (
									<motion.ul 
										className="divide-y divide-border"
										layout
									>
										<AnimatePresence mode="popLayout">
											{list.map((n) => (
												<motion.li
													key={n.id}
													layout
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ 
														opacity: 0, 
														x: -100,
														transition: { duration: 0.2 }
													}}
													transition={{ 
														layout: { duration: 0.3, type: "spring", stiffness: 500, damping: 30 }
													}}
													className={cn(
														"flex items-start justify-between p-3",
														n.readAt ? "bg-transparent" : "bg-primary/10",
													)}
												>
													<div className="flex-1">
														<motion.p 
															className="text-sm text-foreground"
															layout="position"
														>
															{n.body}
														</motion.p>
														<motion.p 
															className="text-xs text-muted-foreground"
															layout="position"
														>
															{new Date(n.createdAt).toLocaleString()}
														</motion.p>
													</div>
													<div className="flex flex-col items-end gap-2 ml-2">
														{!n.readAt && (
															<motion.button
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
																className="text-primary text-xs hover:underline"
																onClick={() =>
																	markRead.mutate({ id: n.id, userId })
																}
																type="button"
															>
																Mark read
															</motion.button>
														)}
														<motion.button
															whileHover={{ scale: 1.1, rotate: 15 }}
															whileTap={{ scale: 0.9 }}
															onClick={() =>
																removeNotificationById.mutate({
																	id: n.id,
																	userId,
																})
															}
															type="button"
															className="text-muted-foreground hover:text-destructive transition-colors"
														>
															<Trash className="h-3.5 w-3.5" />
														</motion.button>
													</div>
												</motion.li>
											))}
										</AnimatePresence>
									</motion.ul>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}