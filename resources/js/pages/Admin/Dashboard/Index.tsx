import { Head, Link } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const peso = (n) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(n);

const fmtMonth = (ym) => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    return new Date(y, m - 1).toLocaleString('en-PH', {
        month: 'short',
        year: '2-digit',
    });
};

const STATUS_LABELS = {
    active: 'Active',
    pending: 'Pending',
    completed: 'Completed',
    rejected: 'Rejected',
    voided: 'Voided',
};

const PIE_COLORS = ['#1D9E75', '#EF9F27', '#378ADD', '#E24B4A', '#888780'];

function StatusBadge({ status }) {
    const map = {
        active: 'bg-emerald-100 text-emerald-800',
        pending: 'bg-amber-100 text-amber-800',
        completed: 'bg-blue-100 text-blue-800',
        rejected: 'bg-red-100 text-red-800',
        voided: 'bg-gray-100 text-gray-700',
        overdue: 'bg-red-100 text-red-800',
        for_approval: 'bg-amber-100 text-amber-800',
    };
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-700'}`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// Pastel card — alternates blue (#c3d9eb / --secondary) and green (#b4e4a1 / --primary)
function StatCard({ title, value, sub, icon, variant = 'blue' }) {
    const bg = variant === 'green' ? 'bg-[#b4e4a1]' : 'bg-[#c3d9eb]';
    return (
        <div className={`${bg} rounded-2xl p-5`}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/50">
                    <span className="text-lg">{icon}</span>
                </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
            {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
        </div>
    );
}

export default function Index({
    stats,
    loansByStatus,
    monthlyLoans,
    monthlyCollections,
    upcomingDues,
    recentLoans,
}) {
    const mergedMonthly = (() => {
        const map = {};
        monthlyLoans.forEach((r) => {
            map[r.month] = {
                month: r.month,
                disbursed: r.total_amount,
                collected: 0,
            };
        });
        monthlyCollections.forEach((r) => {
            if (map[r.month]) map[r.month].collected = r.total_collected;
            else
                map[r.month] = {
                    month: r.month,
                    disbursed: 0,
                    collected: r.total_collected,
                };
        });
        return Object.values(map)
            .sort((a, b) => a.month.localeCompare(b.month))
            .map((r) => ({ ...r, label: fmtMonth(r.month) }));
    })();

    const loanCountData = monthlyLoans.map((r) => ({
        label: fmtMonth(r.month),
        count: r.count,
    }));

    const pieData = loansByStatus.map((r) => ({
        name: STATUS_LABELS[r.status] ?? r.status,
        value: r.count,
    }));

    const recoveryRate = Math.round(
        (stats.total_collected / (stats.total_disbursed || 1)) * 100,
    );

    const tooltipStyle = {
        fontSize: 12,
        borderRadius: 12,
        border: '1px solid #e5e7eb',
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-screen space-y-6 bg-gray-50 p-6">
                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Overview of your lending portfolio
                    </p>
                </div>

                {/* KPI row 1 — blue/green alternating */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard
                        title="Total loans"
                        value={stats.total_loans}
                        sub={`${stats.active_loans} active`}
                        icon="📋"
                        variant="blue"
                    />
                    <StatCard
                        title="Pending approval"
                        value={stats.pending_loans}
                        icon="⏳"
                        variant="green"
                    />
                    <StatCard
                        title="Total borrowers"
                        value={stats.total_borrowers}
                        sub={`${stats.active_borrowers} active`}
                        icon="👥"
                        variant="blue"
                    />
                    <StatCard
                        title="Overdue schedules"
                        value={stats.overdue_schedules}
                        sub={`${stats.pending_payments} awaiting`}
                        icon="⚠️"
                        variant="green"
                    />
                </div>

                {/* KPI row 2 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StatCard
                        title="Total disbursed"
                        value={peso(stats.total_disbursed)}
                        icon="💸"
                        variant="green"
                    />
                    <StatCard
                        title="Total collected"
                        value={peso(stats.total_collected)}
                        sub={`${recoveryRate}% recovery rate`}
                        icon="💰"
                        variant="blue"
                    />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 lg:col-span-2">
                        <p className="mb-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                            Disbursed vs collected (12 months)
                        </p>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart
                                data={mergedMonthly}
                                margin={{
                                    top: 4,
                                    right: 8,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f5f5f5"
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) =>
                                        `₱${(v / 1000).toFixed(0)}k`
                                    }
                                />
                                <Tooltip
                                    formatter={(v, name) => [
                                        peso(v),
                                        name === 'disbursed'
                                            ? 'Disbursed'
                                            : 'Collected',
                                    ]}
                                    labelStyle={{ fontSize: 12 }}
                                    contentStyle={tooltipStyle}
                                />
                                <Legend
                                    formatter={(v) =>
                                        v === 'disbursed'
                                            ? 'Disbursed'
                                            : 'Collected'
                                    }
                                    iconSize={10}
                                    wrapperStyle={{ fontSize: 12 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="disbursed"
                                    stroke="#378ADD"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="collected"
                                    stroke="#1D9E75"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5">
                        <p className="mb-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                            Loans by status
                        </p>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={
                                                PIE_COLORS[
                                                    i % PIE_COLORS.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend
                                    iconSize={10}
                                    wrapperStyle={{ fontSize: 12 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar chart */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <p className="mb-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                        New loans per month
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                            data={loanCountData}
                            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f5f5f5"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar
                                dataKey="count"
                                fill="#c3d9eb"
                                radius={[6, 6, 0, 0]}
                                name="Loans"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tables row */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                        <div className="px-5 pt-5 pb-3">
                            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                                Upcoming dues (next 7 days)
                            </p>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="text-xs text-gray-500">
                                        Borrower
                                    </TableHead>
                                    <TableHead className="text-xs text-gray-500">
                                        Due date
                                    </TableHead>
                                    <TableHead className="text-right text-xs text-gray-500">
                                        Amount
                                    </TableHead>
                                    <TableHead className="text-xs text-gray-500">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingDues.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-8 text-center text-sm text-gray-400"
                                        >
                                            No upcoming dues
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    upcomingDues.map((d) => (
                                        <TableRow
                                            key={d.id}
                                            className="transition-colors hover:bg-[#c3d9eb]/30"
                                        >
                                            <TableCell className="text-sm">
                                                <p className="leading-tight font-medium text-gray-800">
                                                    {d.borrower_name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {d.contract_number}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {new Date(
                                                    d.due_date,
                                                ).toLocaleDateString('en-PH', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-semibold text-gray-800">
                                                {peso(d.amount_due)}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={d.status}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                        <div className="flex items-center justify-between px-5 pt-5 pb-3">
                            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                                Recent loans
                            </p>
                            <Link
                                href="/admin/loans"
                                className="text-xs font-medium text-blue-500 hover:underline"
                            >
                                See All →
                            </Link>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="text-xs text-gray-500">
                                        Borrower
                                    </TableHead>
                                    <TableHead className="text-right text-xs text-gray-500">
                                        Amount
                                    </TableHead>
                                    <TableHead className="text-xs text-gray-500">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentLoans.map((l) => (
                                    <TableRow
                                        key={l.id}
                                        className="transition-colors hover:bg-[#b4e4a1]/30"
                                    >
                                        <TableCell className="text-sm">
                                            <Link
                                                href={`/admin/loans/${l.id}`}
                                                className="leading-tight font-medium text-gray-800 hover:text-blue-600 hover:underline"
                                            >
                                                {l.borrower_name}
                                            </Link>
                                            <p className="text-xs text-gray-400">
                                                {l.contract_number}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right text-sm font-semibold text-gray-800">
                                            {peso(l.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={l.status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
}
