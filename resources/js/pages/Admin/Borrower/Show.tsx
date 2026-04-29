import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    User,
    ShieldCheck,
    Users,
    CreditCard,
    Calendar,
    Globe,
    Phone,
    MapPin,
    Hash,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    AlertTriangle,
    Mail,
    IdCard,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Borrower {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    date_of_birth: string;
    nationality: string;
    account_status: 'pending' | 'verified' | 'rejected';
    created_at: string;
    updated_at: string;
    user: { id: number; email: string; name: string };
    identification: {
        id: number;
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
    loans: {
        id: number;
        contract_number: string;
        amount: number;
        status: string;
        transaction_date: string;
    }[];
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

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(n);

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
    pending: {
        label: 'Pending',
        class: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    verified: {
        label: 'Verified',
        class: 'bg-green-50 text-green-700 border-green-200',
    },
    rejected: {
        label: 'Rejected',
        class: 'bg-red-50 text-red-700 border-red-200',
    },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? statusConfig.pending;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${cfg.class}`}
        >
            {status === 'verified' && <CheckCircle2 className="size-3.5" />}
            {status === 'rejected' && <XCircle className="size-3.5" />}
            {status === 'pending' && <Clock className="size-3.5" />}
            {cfg.label}
        </span>
    );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: any;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 py-2.5">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-medium break-words">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

// ─── Loan status badge ────────────────────────────────────────────────────────
function LoanStatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: 'bg-blue-50 text-blue-700 border-blue-200',
        completed: 'bg-green-50 text-green-700 border-green-200',
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        voided: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? map.pending}`}
        >
            {status}
        </span>
    );
}

// ─── Reject modal ─────────────────────────────────────────────────────────────
function RejectModal({
    open,
    onClose,
    borrowerId,
}: {
    open: boolean;
    onClose: () => void;
    borrowerId: number;
}) {
    const { data, setData, put, processing, reset } = useForm({
        rejection_reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/borrowers/${borrowerId}/reject`, {
            onSuccess: () => {
                toast.success('Borrower rejected.');
                onClose();
                reset();
            },
            onError: () => toast.error('Failed to reject borrower.'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="size-4 text-red-500" />
                            Reject Borrower
                        </DialogTitle>
                        <DialogDescription>
                            This will mark the borrower as rejected. Please
                            provide a reason.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            The borrower will be notified about this decision.
                        </div>
                        <div className="space-y-1.5">
                            <Label>Rejection Reason *</Label>
                            <Textarea
                                placeholder="e.g. Expired ID, incomplete references..."
                                className="min-h-[100px]"
                                value={data.rejection_reason}
                                onChange={(e) =>
                                    setData('rejection_reason', e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={processing}
                        >
                            {processing ? 'Rejecting...' : 'Confirm Reject'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Show({ borrower }: Props) {
    const [rejectOpen, setRejectOpen] = useState(false);

    const { put, processing } = useForm({});

    const handleVerify = () => {
        put(`/admin/borrowers/${borrower.id}/verify`, {
            onSuccess: () => toast.success('Borrower verified successfully.'),
            onError: () => toast.error('Failed to verify borrower.'),
        });
    };

    return (
        <>
            <Head title={`${borrower.first_name} ${borrower.last_name}`} />

            <div className="space-y-6 p-6">
                {/* Top bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/borrowers">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5"
                            >
                                <ArrowLeft className="size-4" />
                                Back
                            </Button>
                        </Link>
                        <Separator orientation="vertical" className="h-5" />
                        <div>
                            <h1 className="text-xl font-semibold">
                                {borrower.first_name} {borrower.last_name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Registered {formatDate(borrower.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <StatusBadge status={borrower.account_status} />

                        {borrower.account_status === 'pending' && (
                            <>
                                <Button
                                    onClick={handleVerify}
                                    disabled={processing}
                                    className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
                                >
                                    <CheckCircle2 className="size-4" />
                                    Verify
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setRejectOpen(true)}
                                    className="gap-1.5"
                                >
                                    <XCircle className="size-4" />
                                    Reject
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ── Left: details ── */}
                    <div className="space-y-5 lg:col-span-2">
                        {/* Personal info */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="size-4" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                                    <div className="space-y-0 pr-0 sm:pr-6">
                                        <InfoRow
                                            icon={User}
                                            label="Full Name"
                                            value={`${borrower.first_name} ${borrower.last_name}`}
                                        />
                                        <Separator />
                                        <InfoRow
                                            icon={Phone}
                                            label="Phone Number"
                                            value={borrower.phone_number}
                                        />
                                        <Separator />
                                        <InfoRow
                                            icon={MapPin}
                                            label="Address"
                                            value={borrower.address}
                                        />
                                    </div>
                                    <div className="space-y-0 pt-0 pl-0 sm:pt-0 sm:pl-6">
                                        <InfoRow
                                            icon={Calendar}
                                            label="Date of Birth"
                                            value={formatDate(
                                                borrower.date_of_birth,
                                            )}
                                        />
                                        <Separator />
                                        <InfoRow
                                            icon={Globe}
                                            label="Nationality"
                                            value={borrower.nationality}
                                        />
                                        <Separator />
                                        <InfoRow
                                            icon={Mail}
                                            label="Account Email"
                                            value={borrower.user?.email ?? '—'}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Identification */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ShieldCheck className="size-4" />
                                    Government ID
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {borrower.identification ? (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-3">
                                            <InfoRow
                                                icon={IdCard}
                                                label="ID Type"
                                                value={
                                                    borrower.identification
                                                        .id_type
                                                }
                                            />
                                            <Separator />
                                            <InfoRow
                                                icon={Hash}
                                                label="ID Number"
                                                value={
                                                    borrower.identification
                                                        .id_number
                                                }
                                            />
                                            <Separator />
                                            <InfoRow
                                                icon={Calendar}
                                                label="Issue Date"
                                                value={formatDate(
                                                    borrower.identification
                                                        .issue_date,
                                                )}
                                            />
                                            <Separator />
                                            <InfoRow
                                                icon={Calendar}
                                                label="Expiry Date"
                                                value={formatDate(
                                                    borrower.identification
                                                        .expiry_date,
                                                )}
                                            />
                                        </div>

                                        {/* ID Photo */}
                                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted p-4">
                                            {borrower.identification
                                                .image_path ? (
                                                <>
                                                    <img
                                                        src={`/storage/${borrower.identification.image_path}`}
                                                        alt="Government ID"
                                                        className="max-h-48 w-full rounded-lg object-contain shadow-sm"
                                                    />
                                                    <a
                                                        href={`/storage/${borrower.identification.image_path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        <ExternalLink className="size-3" />
                                                        View full size
                                                    </a>
                                                </>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    No ID photo uploaded.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        No identification submitted.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* References */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="size-4" />
                                    References ({borrower.references.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {borrower.references.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        No references submitted.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {borrower.references.map((ref, i) => (
                                            <div key={ref.id}>
                                                {i > 0 && (
                                                    <Separator className="mb-4" />
                                                )}
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">
                                                        {ref.first_name[0]}
                                                        {ref.last_name[0]}
                                                    </div>
                                                    <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Name
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {ref.first_name}{' '}
                                                                {ref.last_name}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Relationship
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    ref.relationship
                                                                }
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Phone
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    ref.phone_number
                                                                }
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Address
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {ref.address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Right sidebar ── */}
                    <div className="space-y-5">
                        {/* Account summary */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Account Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Total Loans
                                    </span>
                                    <span className="font-semibold">
                                        {borrower.loans.length}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        References
                                    </span>
                                    <span className="font-semibold">
                                        {borrower.references.length}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        ID Submitted
                                    </span>
                                    <span className="font-semibold">
                                        {borrower.identification ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Registered
                                    </span>
                                    <span className="font-semibold">
                                        {formatDate(borrower.created_at)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Loans */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <CreditCard className="size-4" />
                                    Loans
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {borrower.loans.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        No loans yet.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {borrower.loans.map((loan) => (
                                            <Link
                                                key={loan.id}
                                                href={`/admin/loans/${loan.id}`}
                                            >
                                                <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary hover:bg-muted/30">
                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            {
                                                                loan.contract_number
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(
                                                                loan.transaction_date,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold">
                                                            {formatCurrency(
                                                                loan.amount,
                                                            )}
                                                        </p>
                                                        <LoanStatusBadge
                                                            status={loan.status}
                                                        />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Reject modal */}
            <RejectModal
                open={rejectOpen}
                onClose={() => setRejectOpen(false)}
                borrowerId={borrower.id}
            />
        </>
    );
}
