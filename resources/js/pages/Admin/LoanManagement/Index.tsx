import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    FileText,
    Landmark,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    Search,
    PhilippinePeso,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Loan {
    id: number;
    contract_number: string;
    borrower: {
        full_name: string
    };
    amount: number;
    total_payable: number;
    total_paid: number;
    remaining: number;
    status: 'pending' | 'active' | 'completed' | 'voided';
    is_voided: boolean;
    transaction_date: string;
    pending_payments: number;
    payment_frequency: string;
    loan_duration: number;
    duration_unit: string;
}

interface Props {
    loans: {
        data: Loan[];
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; class: string }> = {
    pending: {
        label: 'Pending',
        class: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    active: {
        label: 'Active',
        class: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    completed: {
        label: 'Completed',
        class: 'bg-green-50 text-green-700 border-green-200',
    },
    voided: {
        label: 'Voided',
        class: 'bg-red-50 text-red-700 border-red-200',
    },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? statusConfig.pending;
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.class}`}
        >
            {cfg.label}
        </span>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number | string;
    icon: React.ElementType;
}) {
    return (
        <div className="rounded-lg border-0 shadow-sm">
            <div className="flex flex-col gap-4 p-5">
                <div className="flex w-full items-center justify-between">
                    <h4 className="text-sm font-bold">{label}</h4>
                    <Icon className="size-5" />
                </div>
                <h1 className="text-2xl font-bold">{value}</h1>
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(value);

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function PaymentProgress({
    totalPaid,
    totalPayable,
}: {
    totalPaid: number;
    totalPayable: number;
}) {
    const pct =
        totalPayable > 0 ? Math.min(100, (totalPaid / totalPayable) * 100) : 0;
    return (
        <div className="flex min-w-[100px] items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-8 text-right text-xs text-muted-foreground">
                {Math.round(pct)}%
            </span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoanIndex({ loans, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status && status !== 'all') params.set('status', status);
        window.location.href = `/admin/loans?${params.toString()}`;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyFilters();
    };

    // Derive quick stats from current page data (ideally pass from controller)
    const totalLoans = loans.total;
    const pending = loans.data.filter((l) => l.status === 'pending').length;
    const active = loans.data.filter((l) => l.status === 'active').length;
    const completed = loans.data.filter((l) => l.status === 'completed').length;
    const voided = loans.data.filter((l) => l.status === 'voided').length;

    return (
        <>
            <Head title="Loans" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Loans
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and review all loan contracts.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total Loans"
                        value={totalLoans}
                        icon={Landmark}
                    />
                    <StatCard label="Pending" value={pending} icon={Clock} />
                    <StatCard
                        label="Active"
                        value={active}
                        icon={PhilippinePeso}
                    />
                    <StatCard
                        label="Completed"
                        value={completed}
                        icon={CheckCircle2}
                    />
                </div>

                {/* Filters */}
                {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by contract number or borrower name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pl-9"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="voided">Voided</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={applyFilters} className="w-full sm:w-auto">
                        Search
                    </Button>
                </div> */}

                {/* Table */}
                <div className="overflow-hidden rounded-lg border-0 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead>Contract #</TableHead>
                                <TableHead>Borrower</TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Loan Amount
                                </TableHead>
                                <TableHead className="hidden lg:table-cell">
                                    Remaining
                                </TableHead>
                                <TableHead className="hidden lg:table-cell">
                                    Progress
                                </TableHead>
                                <TableHead className="hidden sm:table-cell">
                                    Frequency
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loans.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="py-16 text-center text-muted-foreground"
                                    >
                                        No loans found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                loans.data.map((loan) => (
                                    <TableRow
                                        key={loan.id}
                                        className="hover:bg-muted/30"
                                    >
                                        {/* Contract Number */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                                                <span className="font-mono text-sm font-medium">
                                                    {loan.contract_number}
                                                </span>
                                            </div>
                                            {loan.pending_payments > 0 && (
                                                <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-amber-600">
                                                    <AlertCircle className="size-3" />
                                                    {loan.pending_payments}{' '}
                                                    pending payment
                                                    {loan.pending_payments > 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Borrower */}
                                        <TableCell>
                                            <p className="text-sm font-medium">
                                                {loan.borrower_name ?? (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </p>
                                        </TableCell>

                                        {/* Loan Amount */}
                                        <TableCell className="hidden text-sm md:table-cell">
                                            <div>
                                                <p className="font-medium">
                                                    {formatCurrency(
                                                        loan.amount,
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Payable:{' '}
                                                    {formatCurrency(
                                                        loan.total_payable,
                                                    )}
                                                </p>
                                            </div>
                                        </TableCell>

                                        {/* Remaining */}
                                        <TableCell className="hidden text-sm lg:table-cell">
                                            {loan.status === 'completed' ? (
                                                <span className="text-xs font-medium text-green-600">
                                                    Fully Paid
                                                </span>
                                            ) : (
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        loan.remaining,
                                                    )}
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Progress */}
                                        <TableCell className="hidden lg:table-cell">
                                            <PaymentProgress
                                                totalPaid={loan.total_paid}
                                                totalPayable={
                                                    loan.total_payable
                                                }
                                            />
                                        </TableCell>

                                        {/* Frequency */}
                                        <TableCell className="hidden text-sm text-muted-foreground capitalize sm:table-cell">
                                            {loan.payment_frequency}
                                            <span className="block text-xs">
                                                {loan.loan_duration}{' '}
                                                {loan.duration_unit}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <StatusBadge status={loan.status} />
                                        </TableCell>


                                        {/* Action */}
                                        <TableCell className="text-right">
                                            <Link
                                                href={`/admin/loans/${loan.id}`}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="cursor-pointer gap-1"
                                                >
                                                    <Eye className="size-3.5" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {loans.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                Page {loans.current_page} of {loans.last_page}
                            </p>
                            <div className="flex gap-1">
                                {loans.links.map((link, i) =>
                                    link.url ? (
                                        <a
                                            key={i}
                                            href={link.url}
                                            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors ${
                                                link.active
                                                    ? 'bg-primary font-semibold text-primary-foreground'
                                                    : 'hover:bg-muted'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-muted-foreground opacity-50"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
