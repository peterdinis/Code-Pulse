"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notifications } = api.notification.list.useQuery(
    { userId },
    { enabled: open }
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const list = notifications ?? [];
  const hasUnread = (unreadCount ?? 0) > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-[320px] max-h-[400px] overflow-hidden rounded-xl border border-border bg-card shadow-xl z-50 flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Notifications
            </span>
            {hasUnread && (
              <button
                type="button"
                onClick={() => markAllRead.mutate({ userId })}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {list.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                No notifications
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {list.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      "p-3 hover:bg-muted/50 transition-colors",
                      !n.readAt && "bg-primary/5"
                    )}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        if (!n.readAt) markRead.mutate({ id: n.id, userId });
                      }}
                    >
                      <p className="text-[13px] font-medium text-foreground">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-[12px] text-muted-foreground mt-0.5">
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
