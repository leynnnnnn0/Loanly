import MainLogo from '../../../public/images/mainLogo.png';
import {
    Home,
    Wallet,
    Settings,
    BellIcon,
    AlertCircle,
    ShieldCheck,
    ShieldX,
    LogOut,
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEcho } from '@laravel/echo-react';

type BorrowerStatus = 'pending' | 'verified' | 'rejected' | 'not_verified';
type UnverifiedStatus = 'unverified' | 'pending' | 'rejected' | 'not_verified';
interface VerificationConfig {
    icon: LucideIcon;
    tip: string;
    color: string;
    dot: string;
    label: string;
}

const verificationConfig: Record<UnverifiedStatus, VerificationConfig> = {
    unverified: {
        icon: AlertCircle,
        tip: 'Your profile is not verified. Complete verification to apply for loans.',
        color: 'text-amber-500',
        dot: 'bg-amber-400',
        label: 'Not Verified',
    },
    pending: {
        icon: AlertCircle,
        tip: "Your verification is under review. We'll notify you once it's done.",
        color: 'text-blue-500',
        dot: 'bg-blue-400',
        label: 'Under Review',
    },
    rejected: {
        icon: ShieldX,
        tip: 'Your verification was rejected. Please re-submit or contact support.',
        color: 'text-red-500',
        dot: 'bg-red-500',
        label: 'Rejected',
    },
    not_verified: {
        icon: ShieldX,
        tip: 'Your have not verified your account yet. Verify it now to get a loan.',
        color: 'text-orange-500',
        dot: 'bg-orange-500',
        label: 'Not Verified',
    },
};

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
            <button onClick={() => setOpen(!open)} className="relative">
                <BellIcon className="size-5 text-[#595959]" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {notifications.length}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b p-3">
                        <span className="text-sm font-semibold">
                            Notifications
                        </span>
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
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">
                                        🔔 {notif.message}
                                    </span>
                                    {notif.description && (
                                        <span className="text-xs text-gray-500">
                                            {notif.description}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() =>
                                        setNotifications((prev) =>
                                            prev.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="ml-2 shrink-0 text-xs text-gray-400 hover:text-red-500"
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

export default function Navbar() {
    const { url, props } = usePage<{
        auth: { borrower_status: BorrowerStatus; user: { id: number } };
    }>();
    const borrowerStatus: BorrowerStatus = props.auth?.borrower_status ?? null;
    const userId = props.auth?.user?.id;
    const isVerified = borrowerStatus === 'verified';
    const statusKey: UnverifiedStatus =
        borrowerStatus === null || borrowerStatus === 'verified'
            ? 'unverified'
            : borrowerStatus;
    const badge: VerificationConfig | null = isVerified
        ? null
        : verificationConfig[statusKey];
    const routes = [
        { logo: Home, href: '/user/dashboard', name: 'Dashboard' },
        { logo: Wallet, href: '/user/my-loans', name: 'My Loans' },
        { logo: Settings, href: '/user/profile', name: 'My Profile' },
    ];
    return (
        <div className="sticky top-0 z-50">
            <nav className="flex items-center justify-between bg-[#FCFCFC] py-5">
                <div className="flex items-center gap-10">
                    <img src={MainLogo} alt="Loanly Logo" className="size-14" />
                    <div className="flex items-center gap-5">
                        {routes.map((item) => {
                            const isActive = url.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative flex items-center gap-1 text-sm font-bold transition-colors ${
                                        isActive
                                            ? 'border-b-2 border-b-accent text-accent'
                                            : 'text-[#7e7e7e] hover:text-black'
                                    }`}
                                >
                                    <item.logo
                                        className={`size-4 transition-colors ${
                                            isActive
                                                ? 'text-accent'
                                                : 'text-[#7e7e7e]'
                                        }`}
                                    />
                                    {item.name}
                                    {item.href === '/user/profile' &&
                                        !isActive &&
                                        badge && (
                                            <span className="relative ml-0.5 flex size-2">
                                                <span
                                                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${badge.dot}`}
                                                />
                                                <span
                                                    className={`relative inline-flex size-2 rounded-full ${badge.dot}`}
                                                />
                                            </span>
                                        )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ClientOnly>
                        <NotificationBell userId={userId} />
                    </ClientOnly>
                    <button>
                        <LogOut
                            onClick={() => router.post('/logout')}
                            className="size-5 cursor-pointer text-[#595959]"
                        />
                    </button>
                </div>
            </nav>
        </div>
    );
}
