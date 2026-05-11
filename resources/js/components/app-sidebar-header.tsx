import { useEcho } from '@laravel/echo-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

function NotificationBell({ userId }: { userId: number }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    useEcho(
        `App.Models.User.${userId}`,
        '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
        (notification: any) => {
            setNotifications((prev) => [notification, ...prev]);
        },
    );

    const markAllAsRead = () => {
        setNotifications([]);
        setOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)}>
                <Bell />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {notifications.length}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b p-3">
                        <span className="font-semibold">Notifications</span>
                        {notifications.length > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-500 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notif, index) => (
                            <div
                                key={index}
                                className="flex items-start justify-between border-b p-3 text-sm hover:bg-gray-50"
                            >
                                <span>
                                    🔔 {notif.message} from{' '}
                                    <strong>{notif.borrower}</strong>
                                </span>
                                <button
                                    onClick={() =>
                                        setNotifications((prev) =>
                                            prev.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="ml-2 text-xs text-gray-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function ClientOnly({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return <>{children}</>;
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props as any;

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center justify-between gap-2">
                <div>
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <ClientOnly>
                    <NotificationBell userId={auth.user.id} />
                </ClientOnly>
            </div>
        </header>
    );
}
