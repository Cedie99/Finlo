"use client";

import { useSyncExternalStore } from "react";
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle, Trash2, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { notificationStore, EMPTY_NOTIFICATIONS, type AppNotification } from "@/lib/stores/notificationStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  AppNotification["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  error:   { icon: AlertCircle,   color: "text-red-500",   bg: "bg-red-50" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  info:    { icon: Info,          color: "text-blue-500",  bg: "bg-blue-50" },
  success: { icon: CheckCircle,   color: "text-green-500", bg: "bg-green-50" },
};

export function NotificationBell() {
  const notifications = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getSnapshot,
    () => EMPTY_NOTIFICATIONS
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleOpenChange(open: boolean) {
    if (open && unreadCount > 0) {
      notificationStore.markAllRead();
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className="relative p-2 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-80 p-0 gap-0 rounded-2xl overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">Notifications</span>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 h-7 px-2"
                onClick={notificationStore.markAllRead}
              >
                <CheckCheck size={12} className="mr-1" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 h-7 px-2"
                onClick={notificationStore.clearAll}
              >
                <Trash2 size={12} className="mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
              <Bell size={28} className="opacity-30" />
              <p className="text-xs">No notifications</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {notifications.map((n) => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                return (
                  <li
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors",
                      !n.read && "bg-indigo-50/40"
                    )}
                  >
                    <div className={cn("mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center", cfg.bg)}>
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 leading-snug">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.description}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
