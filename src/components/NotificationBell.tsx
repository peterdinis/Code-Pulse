"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, Trash, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

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

	const removeAllNotifications =
		api.notification.cleanAllNotifications.useMutation({
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
					animate={
						hasUnread
							? {
									scale: [1, 1.2, 1],
									rotate: [0, 15, -15, 0],
								}
							: {}
					}
					transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
				>
					<Bell className="h-5 w-5" />
				</motion.div>
				{hasUnread && (
					<motion.span
						animate={{ scale: 1 }}
						className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"
						exit={{ scale: 0 }}
						initial={{ scale: 0 }}
					/>
				)}
			</button>
			<AnimatePresence>
				{open && (
					<motion.div
						animate={{ opacity: 1, y: 0, scale: 1 }}
						className="absolute top-full right-0 z-130 mt-1 flex max-h-100 w-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl"
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
					>
						<div className="flex items-center justify-between border-border border-b p-3">
							<span className="font-semibold text-foreground text-sm">
								Notifications
							</span>
							<div className="flex items-center gap-2">
								<motion.button
									animate={
										isCleaning
											? {
													rotate: [0, -15, 15, -15, 15, 0],
													scale: [1, 1.1, 1],
												}
											: {}
									}
									className="text-muted-foreground transition-colors hover:text-destructive"
									onClick={handleCleanAll}
									transition={{ duration: 0.5 }}
									type="button"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Trash2 className="h-4 w-4" />
								</motion.button>
								{hasUnread && (
									<button
										className="text-primary text-xs transition-colors hover:underline"
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
										animate={{ opacity: 1 }}
										className="p-4 text-center text-muted-foreground text-sm"
										exit={{ opacity: 0 }}
										initial={{ opacity: 0 }}
									>
										No notifications
									</motion.p>
								) : (
									<motion.ul className="divide-y divide-border" layout>
										<AnimatePresence mode="popLayout">
											{list.map((n) => (
												<motion.li
													animate={{ opacity: 1, y: 0 }}
													className={cn(
														"flex items-start justify-between p-3",
														n.readAt ? "bg-transparent" : "bg-primary/10",
													)}
													exit={{
														opacity: 0,
														x: -100,
														transition: { duration: 0.2 },
													}}
													initial={{ opacity: 0, y: -10 }}
													key={n.id}
													layout
													transition={{
														layout: {
															duration: 0.3,
															type: "spring",
															stiffness: 500,
															damping: 30,
														},
													}}
												>
													<div className="flex-1">
														<motion.p
															className="text-foreground text-sm"
															layout="position"
														>
															{n.body}
														</motion.p>
														<motion.p
															className="text-muted-foreground text-xs"
															layout="position"
														>
															{new Date(n.createdAt).toLocaleString()}
														</motion.p>
													</div>
													<div className="ml-2 flex flex-col items-end gap-2">
														{!n.readAt && (
															<motion.button
																className="text-primary text-xs hover:underline"
																onClick={() =>
																	markRead.mutate({ id: n.id, userId })
																}
																type="button"
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
															>
																Mark read
															</motion.button>
														)}
														<motion.button
															className="text-muted-foreground transition-colors hover:text-destructive"
															onClick={() =>
																removeNotificationById.mutate({
																	id: n.id,
																	userId,
																})
															}
															type="button"
															whileHover={{ scale: 1.1, rotate: 15 }}
															whileTap={{ scale: 0.9 }}
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
