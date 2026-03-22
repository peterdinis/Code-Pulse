"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
		},
	});
	const markAllRead = api.notification.markAllRead.useMutation({
		onSuccess: () => {
			utils.notification.list.invalidate();
			utils.notification.unreadCount.invalidate();
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

	return (
		<div className="relative" ref={ref}>
			<button
				aria-label="Notifications"
				className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				onClick={() => setOpen((o) => !o)}
				type="button"
			>
				<Bell className="h-5 w-5" />
				{hasUnread && (
					<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
				)}
			</button>
			{open && (
				<div className="absolute top-full right-0 z-50 mt-1 flex max-h-100 w-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
					<div className="flex items-center justify-between border-border border-b p-3">
						<span className="font-semibold text-foreground text-sm">
							Notifications
						</span>
						{hasUnread && (
							<button
								className="text-primary text-xs hover:underline"
								onClick={() => markAllRead.mutate({ userId })}
								type="button"
							>
								Mark all read
							</button>
						)}
					</div>
					<div className="flex-1 overflow-y-auto">
						{list.length === 0 ? (
							<p className="p-4 text-center text-muted-foreground text-sm">
								No notifications
							</p>
						) : (
							<ul className="divide-y divide-border">
								{list.map((n) => (
									<li
										className={cn(
											"p-3 transition-colors hover:bg-muted/50",
											!n.readAt && "bg-primary/5",
										)}
										key={n.id}
									>
										<button
											className="w-full text-left"
											onClick={() => {
												if (!n.readAt) markRead.mutate({ id: n.id, userId });
											}}
											type="button"
										>
											<p className="font-medium text-[13px] text-foreground">
												{n.title}
											</p>
											{n.body && (
												<p className="mt-0.5 text-[12px] text-muted-foreground">
													{n.body}
												</p>
											)}
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
