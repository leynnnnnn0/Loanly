import { Link,router,usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
AlertCircle,
Home,
LogOut,
Menu,
Settings,
ShieldX,
Wallet,
X
} from 'lucide-react';
import { useState } from 'react';
import NotificationBell from '@/components/notification-bell';
import MainLogo from '../../../public/images/mainLogo.png';

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

export default function Navbar() {
    const { url, props } = usePage<{
        auth: { borrower_status: BorrowerStatus; user: { id: number } };
    }>();
    const borrowerStatus: BorrowerStatus = props.auth?.borrower_status ?? null;
    const userId = props.auth?.user?.id;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            <nav className="bg-[#FCFCFC]/95 py-3 backdrop-blur sm:py-5">
                <div className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-10">
                        <img
                            src={MainLogo}
                            alt="Loanly Logo"
                            className="size-11 shrink-0 sm:size-14"
                        />
                        <div className="hidden items-center gap-5 md:flex">
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
                    <div className="flex items-center gap-3 sm:gap-4">
                        <NotificationBell userId={userId} />
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="hidden rounded-full p-2 text-[#595959] transition-colors hover:bg-black/5 hover:text-black md:inline-flex"
                            aria-label="Log out"
                        >
                            <LogOut className="size-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            className="inline-flex size-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#595959] shadow-sm md:hidden"
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="mt-3 rounded-2xl border border-black/5 bg-white p-2 shadow-sm md:hidden">
                        {routes.map((item) => {
                            const isActive = url.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`relative flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition-colors ${
                                        isActive
                                            ? 'bg-accent/10 text-accent'
                                            : 'text-[#595959] hover:bg-black/[0.03] hover:text-black'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <item.logo className="size-4" />
                                        {item.name}
                                    </span>
                                    {item.href === '/user/profile' && badge && (
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                statusKey === 'rejected'
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-orange-50 text-orange-600'
                                            }`}
                                        >
                                            {badge.label}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#595959] transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="size-4" />
                            Log out
                        </button>
                    </div>
                )}
            </nav>
        </div>
    );
}
