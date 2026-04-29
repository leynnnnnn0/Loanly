import { Head, usePage } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Phone,
    MapPin,
    Globe,
    Calendar,
    ShieldCheck,
    Users,
    Hash,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ExternalLink,
    CreditCard,
    FileText,
    VerifiedIcon,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Borrower {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    date_of_birth: string;
    nationality: string;
    account_status: 'pending' | 'verified' | 'rejected' | 'not_verified';
    created_at: string;
    identification: {
        id_type: string;
        id_number: string;
        issue_date: string;
        expiry_date: string;
        image_path: string | null;
    } | null;
    references: {
        id: number;
        first_name: string;
        last_name: string;
        phone_number: string;
        address: string;
        relationship: string;
    }[];
    loans_count: number;
}

interface Props {
    borrower: Borrower;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

// ─── Account Status config ────────────────────────────────────────────────────
const accountStatusMap = {
    pending: {
        label: 'Pending Review',
        icon: Clock,
        pill: 'bg-orange-400 text-white border border-yellow-200',
        banner: 'bg-orange-400 border-yellow-200 text-white',
        bannerIcon: AlertCircle,
        bannerText:
            "Your account is currently under review. We'll notify you once it's been verified.",
    },
    verified: {
        label: 'Verified',
        icon: CheckCircle2,
        pill: 'bg-green-50 text-green-700 border border-green-200',
        banner: 'bg-green-50 border-green-200 text-green-800',
        bannerIcon: CheckCircle2,
        bannerText:
            'Your account has been verified. You can now apply for loans.',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        pill: 'bg-red-50 text-red-700 border border-red-200',
        banner: 'bg-red-50 border-red-200 text-red-800',
        bannerIcon: XCircle,
        bannerText:
            'Your verification was rejected. Please contact support for assistance.',
    },
    not_verified: {
        label: 'Not Verified',
        icon: XCircle,
        pill: 'bg-orange-50 text-red-700 border border-orange-200',
        banner: 'bg-orange-50 border-red-200 text-orange-800',
        bannerIcon: XCircle,
        bannerText:
            'Your account is not verified. Verify it now to get a loan.',
    },
};

// ─── Detail Row ───────────────────────────────────────────────────────────────
function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: any;
    label: string;
    value: string;
}) {
    return (
        <div className="group flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-muted/40">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{value || '—'}</p>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Index({ borrower }: Props) {
    const status =
        accountStatusMap[borrower.account_status] ?? accountStatusMap.pending;
    const StatusIcon = status.icon;
    const BannerIcon = status.bannerIcon;

    const initials =
        `${borrower.first_name?.[0] ?? ''}${borrower.last_name?.[0] ?? ''}`.toUpperCase();

    return (
        <>
            <Head title="My Profile" />

            <div className="min-h-screen space-y-8 bg-[#FCFCFC] px-50 pb-20">
                <Navbar />

                {/* ── Profile hero ── */}
                <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
                    {/* Subtle top accent line */}
                    <div className="h-1 w-full bg-primary" />

                    <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
                        {/* Left: Avatar + name */}
                        <div className="flex items-center gap-4">
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-muted text-xl font-bold tracking-tight">
                                {initials}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">
                                    {borrower.first_name} {borrower.last_name}
                                </h1>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <span>{borrower.nationality}</span>
                                    <span className="text-border">·</span>
                                    <span>
                                        Member since{' '}
                                        {new Date(
                                            borrower.created_at,
                                        ).getFullYear()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Status + stats */}
                        <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.pill}`}
                            >
                                <StatusIcon className="size-3.5" />
                                {status.label}
                            </span>

                        </div>
                    </div>
                </div>
                {/* ── Status banner ── */}
                <div
                    className={`flex items-start gap-3 rounded-xl border p-4 ${status.banner}`}
                >
                    <BannerIcon className="mt-0.5 size-4 shrink-0" />
                    <p className="text-sm leading-relaxed">
                        {status.bannerText}
                    </p>
                </div>

                {/* ── Tabs ── */}
                <Tabs defaultValue="personal">
                    <TabsList className="mb-2 h-11 w-full rounded-xl bg-muted/60 p-1">
                        <TabsTrigger
                            value="personal"
                            className="flex-1 gap-2 rounded-lg text-sm data-[state=active]:shadow-sm"
                        >
                            <User className="size-3.5" />
                            Personal Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="identity"
                            className="flex-1 gap-2 rounded-lg text-sm data-[state=active]:shadow-sm"
                        >
                            <ShieldCheck className="size-3.5" />
                            ID Verification
                        </TabsTrigger>
                        <TabsTrigger
                            value="references"
                            className="flex-1 gap-2 rounded-lg text-sm data-[state=active]:shadow-sm"
                        >
                            <Users className="size-3.5" />
                            References
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Tab: Personal Info ── */}
                    <TabsContent value="personal">
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <User className="size-4 text-muted-foreground" />
                                    Personal Information
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Your registered personal details. Contact
                                    support to make changes.
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-1 pt-2">
                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                    <DetailRow
                                        icon={User}
                                        label="First Name"
                                        value={borrower.first_name}
                                    />
                                    <DetailRow
                                        icon={User}
                                        label="Last Name"
                                        value={borrower.last_name}
                                    />
                                    <DetailRow
                                        icon={Phone}
                                        label="Phone Number"
                                        value={borrower.phone_number}
                                    />
                                    <DetailRow
                                        icon={Globe}
                                        label="Nationality"
                                        value={borrower.nationality}
                                    />
                                    <DetailRow
                                        icon={Calendar}
                                        label="Date of Birth"
                                        value={formatDate(
                                            borrower.date_of_birth,
                                        )}
                                    />
                                    <DetailRow
                                        icon={Calendar}
                                        label="Member Since"
                                        value={formatDate(borrower.created_at)}
                                    />
                                </div>
                                <Separator className="my-2" />
                                <DetailRow
                                    icon={MapPin}
                                    label="Address"
                                    value={borrower.address}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Tab: ID Verification ── */}
                    <TabsContent value="identity">
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <ShieldCheck className="size-4 text-muted-foreground" />
                                    Government ID
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    The ID you submitted during verification.
                                </p>
                            </CardHeader>
                            <CardContent>
                                {borrower.identification ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                            <DetailRow
                                                icon={FileText}
                                                label="ID Type"
                                                value={
                                                    borrower.identification
                                                        .id_type
                                                }
                                            />
                                            <DetailRow
                                                icon={Hash}
                                                label="ID Number"
                                                value={
                                                    borrower.identification
                                                        .id_number
                                                }
                                            />
                                            <DetailRow
                                                icon={Calendar}
                                                label="Issue Date"
                                                value={formatDate(
                                                    borrower.identification
                                                        .issue_date,
                                                )}
                                            />
                                            <DetailRow
                                                icon={Calendar}
                                                label="Expiry Date"
                                                value={formatDate(
                                                    borrower.identification
                                                        .expiry_date,
                                                )}
                                            />
                                        </div>

                                        <Separator />

                                        {/* ID Photo */}
                                        <div>
                                            <p className="mb-3 text-xs font-medium text-muted-foreground">
                                                ID Photo
                                            </p>
                                            {borrower.identification
                                                .image_path ? (
                                                <div className="group relative overflow-hidden rounded-xl border bg-muted/30">
                                                    <img
                                                        src={`/storage/${borrower.identification.image_path}`}
                                                        alt="Government ID"
                                                        className="max-h-64 w-full object-contain p-4"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100">
                                                        <a
                                                            href={`/storage/${borrower.identification.image_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-md"
                                                        >
                                                            <ExternalLink className="size-3" />
                                                            View Full Size
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center text-muted-foreground">
                                                    <ShieldCheck className="size-8 opacity-30" />
                                                    <p className="text-sm">
                                                        No ID photo uploaded.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                                        <ShieldCheck className="size-10 opacity-20" />
                                        <div>
                                            <p className="font-medium">
                                                No ID submitted
                                            </p>
                                            <p className="text-sm">
                                                Complete your verification to
                                                submit your ID.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Tab: References ── */}
                    <TabsContent value="references">
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <Users className="size-4 text-muted-foreground" />
                                    References
                                    <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                                        {borrower.references.length}
                                    </span>
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    People who can vouch for you during the loan
                                    review process.
                                </p>
                            </CardHeader>
                            <CardContent>
                                {borrower.references.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                                        <Users className="size-10 opacity-20" />
                                        <div>
                                            <p className="font-medium">
                                                No references submitted
                                            </p>
                                            <p className="text-sm">
                                                Complete your verification to
                                                add references.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {borrower.references.map((ref, i) => (
                                            <div
                                                key={ref.id}
                                                className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                                            >
                                                {/* Avatar + name */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary  text-sm font-bold text-white uppercase">
                                                        {ref.first_name[0]}
                                                        {ref.last_name[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold">
                                                            {ref.first_name}{' '}
                                                            {ref.last_name}
                                                        </p>
                                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                                            {ref.relationship}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Contact info */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Phone className="size-3 shrink-0" />
                                                        <span className="truncate font-medium text-foreground">
                                                            {ref.phone_number}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                                        <MapPin className="mt-0.5 size-3 shrink-0" />
                                                        <span className="leading-snug font-medium text-foreground">
                                                            {ref.address}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
