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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Search,
    Users,
    UserCheck,
    UserX,
    Clock,
    ChevronRight,
    Eye,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Borrower {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    nationality: string;
    account_status: 'pending' | 'verified' | 'rejected';
    created_at: string;
    identification: {
        id_type: string;
        id_number: string;
    } | null;
    loans_count: number;
}

interface Props {
    borrowers: {
        data: Borrower[];
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
    stats: {
        total: number;
        pending: number;
        verified: number;
        rejected: number;
    };
}

// ─── Status Badge ────────────────────────────────────────────────────────────
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
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.class}`}
        >
            {cfg.label}
        </span>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="border-0 shadow-sm rounded-lg">
            <div className="flex flex-col  gap-4 p-5">
                <div className="flex items-center justify-between w-full">
                    <h4 className="font-bold text-sm">
                        {label}
                    </h4>
                    <Icon className="size-5"/>
                </div>
                <h1 className="text-2xl font-bold">{value}</h1>
                
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BorrowerIndex({ borrowers, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status && status !== 'all') params.set('status', status);
        window.location.href = `/admin/borrowers?${params.toString()}`;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyFilters();
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    return (
        <>
            <Head title="Borrowers" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Borrowers
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and review all registered borrowers.
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total"
                        value={stats.total}
                        icon={Users}
                        color="bg-slate-700"
                    />
                    <StatCard
                        label="Pending"
                        value={stats.pending}
                        icon={Clock}
                        color="bg-amber-500"
                    />
                    <StatCard
                        label="Verified"
                        value={stats.verified}
                        icon={UserCheck}
                        color="bg-green-600"
                    />
                    <StatCard
                        label="Rejected"
                        value={stats.rejected}
                        icon={UserX}
                        color="bg-red-500"
                    />
                </div>

                {/* Filters */}
                {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone, or ID number..."
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
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={applyFilters} className="w-full sm:w-auto">
                        Search
                    </Button>
                </div> */}

                {/* Table */}
                <div className="border-0 shadow-sm">
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead>Borrower</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Nationality
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell">
                                        ID Type
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell">
                                        Loans
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Registered
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {borrowers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-16 text-center text-muted-foreground"
                                        >
                                            No borrowers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    borrowers.data.map((borrower) => (
                                        <TableRow
                                            key={borrower.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                borrower.first_name
                                                            }{' '}
                                                            {borrower.last_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground md:hidden">
                                                            {
                                                                borrower.phone_number
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                                                {borrower.phone_number}
                                            </TableCell>
                                            <TableCell className="hidden text-sm md:table-cell">
                                                {borrower.nationality}
                                            </TableCell>
                                            <TableCell className="hidden text-sm lg:table-cell">
                                                {borrower.identification
                                                    ?.id_type ?? (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden text-sm lg:table-cell">
                                                {borrower.loans_count}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={
                                                        borrower.account_status
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                                                {formatDate(
                                                    borrower.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={`/borrowers/${borrower.id}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1 hover:und cursor-pointer"
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
                        {borrowers.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Page {borrowers.current_page} of{' '}
                                    {borrowers.last_page}
                                </p>
                                <div className="flex gap-1">
                                    {borrowers.links.map((link, i) =>
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
            </div>
        </>
    );
}
