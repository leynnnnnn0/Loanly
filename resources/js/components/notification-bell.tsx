import { Link } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConfirmActionDialog from '@/components/confirm-action-dialog';

interface AppNotification {
    id: string;
    message: string;
    description?: string | null;
    action_url?: string | null;
    read_at?: string | null;
    created_at?: string | null;
}

const csrfToken = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

async function notificationRequest(url: string, method = 'GET') {
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Notification request failed.');
    }

    return response.json();
}

function ClientOnly({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setMounted(true), 0);

        return () => window.clearTimeout(timer);
    }, []);

    if (!mounted) {
        return null;
    }

    return <>{children}</>;
}

function NotificationBellInner({ userId }: { userId: number }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [confirmReadAll, setConfirmReadAll] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<AppNotification | null>(
        null,
    );

    useEffect(() => {
        notificationRequest('/notifications')
            .then((payload) => {
                setNotifications(payload.notifications ?? []);
                setUnreadCount(payload.unread_count ?? 0);
            })
            .catch(() => null);
    }, []);

    useEcho(
        `App.Models.User.${userId}`,
        '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
        (notification: AppNotification) => {
            setNotifications((current) => [notification, ...current]);
            setUnreadCount((count) => count + 1);
        },
    );

    const markAllAsRead = async () => {
        const previousNotifications = notifications;
        const previousUnreadCount = unreadCount;

        setNotifications((current) =>
            current.map((notification) => ({
                ...notification,
                read_at: notification.read_at ?? new Date().toISOString(),
            })),
        );
        setUnreadCount(0);
        setConfirmReadAll(false);

        try {
            await notificationRequest('/notifications/read', 'PATCH');
        } catch {
            setNotifications(previousNotifications);
            setUnreadCount(previousUnreadCount);
            toast.error('Unable to mark notifications as read.');
        }
    };

    const markAsRead = async (notification: AppNotification) => {
        if (!notification.read_at) {
            setUnreadCount((count) => Math.max(0, count - 1));

            try {
                await notificationRequest(
                    `/notifications/${notification.id}/read`,
                    'PATCH',
                );
            } catch {
                toast.error('Unable to mark notification as read.');
            }
        }

        setNotifications((current) =>
            current.map((item) =>
                item.id === notification.id
                    ? { ...item, read_at: item.read_at ?? new Date().toISOString() }
                    : item,
            ),
        );
    };

    const removeNotification = async (id: string) => {
        const previousNotifications = notifications;
        const previousUnreadCount = unreadCount;

        setNotifications((current) =>
            current.filter((notification) => notification.id !== id),
        );
        setUnreadCount((count) => {
            const removed = notifications.find(
                (notification) => notification.id === id,
            );

            return removed && !removed.read_at ? Math.max(0, count - 1) : count;
        });
        setPendingDelete(null);

        try {
            await notificationRequest(`/notifications/${id}`, 'DELETE');
        } catch {
            setNotifications(previousNotifications);
            setUnreadCount(previousUnreadCount);
            toast.error('Unable to delete notification.');
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="relative inline-flex size-9 items-center justify-center rounded-full text-[#595959] transition-colors hover:bg-black/5 hover:text-black"
                aria-label="Notifications"
            >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="fixed top-16 right-4 left-4 z-50 overflow-hidden rounded-2xl border bg-white shadow-lg sm:absolute sm:top-auto sm:right-0 sm:left-auto sm:mt-2 sm:w-[22rem]">
                    <div className="flex items-center justify-between border-b p-3">
                        <span className="text-sm font-semibold">
                            Notifications
                        </span>
                        {notifications.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setConfirmReadAll(true)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                            >
                                <CheckCheck className="size-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-5 text-sm text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.map((notification) => {
                                const content = (
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-2">
                                            {!notification.read_at && (
                                                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {notification.message}
                                                </p>
                                                {notification.description && (
                                                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                                                        {
                                                            notification.description
                                                        }
                                                    </p>
                                                )}
                                                {notification.created_at && (
                                                    <p className="mt-1 text-[11px] text-gray-400">
                                                        {
                                                            notification.created_at
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );

                                return (
                                    <div
                                        key={notification.id}
                                        className="flex items-start gap-2 border-b p-3 last:border-b-0 hover:bg-gray-50"
                                    >
                                        {notification.action_url ? (
                                            <Link
                                                href={notification.action_url}
                                                onClick={() =>
                                                    void markAsRead(
                                                        notification,
                                                    )
                                                }
                                                className="min-w-0 flex-1"
                                            >
                                                {content}
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void markAsRead(
                                                        notification,
                                                    )
                                                }
                                                className="min-w-0 flex-1 text-left"
                                            >
                                                {content}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPendingDelete(notification)
                                            }
                                            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                            aria-label="Delete notification"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            <ConfirmActionDialog
                open={confirmReadAll}
                title="Mark all notifications as read?"
                description="This will clear the unread indicator for every notification in your list."
                confirmLabel="Mark all read"
                onConfirm={() => void markAllAsRead()}
                onOpenChange={setConfirmReadAll}
            />
            <ConfirmActionDialog
                open={Boolean(pendingDelete)}
                title="Delete notification?"
                description="This notification will be removed from your account."
                confirmLabel="Delete"
                destructive
                onConfirm={() => {
                    if (pendingDelete) {
                        void removeNotification(pendingDelete.id);
                    }
                }}
                onOpenChange={(value) => {
                    if (!value) {
                        setPendingDelete(null);
                    }
                }}
            />
        </div>
    );
}

export default function NotificationBell({ userId }: { userId?: number }) {
    if (!userId) {
        return null;
    }

    return (
        <ClientOnly>
            <NotificationBellInner userId={userId} />
        </ClientOnly>
    );
}
