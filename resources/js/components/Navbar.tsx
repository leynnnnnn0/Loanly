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
        auth: { borrower_status: BorrowerStatus };
    }>();

    const borrowerStatus: BorrowerStatus = props.auth?.borrower_status ?? null;
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
                {/* Left: Logo + routes */}
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

                                    {item.href === '/user/profile' && isActive == false && badge && (
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

                {/* Right: verification pill + bell */}
                <div className="flex items-center gap-4">
                    {/* {badge && (
                        <Link
                            href="/user/profile"
                            title={badge.tip}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80 ${badge.color} border-current bg-current/5`}
                        >
                            <badge.icon className="size-3.5 shrink-0" />
                            <span className="hidden sm:inline">
                                {badge.label}
                            </span>
                        </Link>
                    )}

                    {isVerified && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                            <ShieldCheck className="size-4" />
                            <span className="hidden sm:inline">Verified</span>
                        </span>
                    )} */}

                    <button>
                        <LogOut onClick={() => router.post('/logout')} className="size-5 text-[#595959] cursor-pointer" />
                    </button>
                </div>
            </nav>
        </div>
    );
}
