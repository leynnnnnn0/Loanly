import { Head,router } from '@inertiajs/react';
import { useState } from 'react';
import {
Area,
AreaChart,
CartesianGrid,
Legend,
ResponsiveContainer,
Tooltip,
XAxis,
YAxis
} from 'recharts';

// ── Helpers ───────────────────────────────────────────────────────────────────
const peso = (n) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(n);

const fmtDay = (d) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

// ── Stat Card ─────────────────────────────────────────────────────────────────
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

// ── Section wrapper ───────────────────────────────────────────────────────────
function Panel({ title, children }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {title && (
                <div className="px-5 pt-5 pb-3">
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                        {title}
                    </p>
                </div>
            )}
            {children}
        </div>
    );
}

const tooltipStyle = {
    fontSize: 12,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Index({
    filters,
    kpis,
    dailySeries,
}) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function applyFilter() {
        router.get(
            '/sales',
            { from, to },
            { preserveState: true },
        );
    }

    const netFlow = kpis.total_collected - kpis.total_disbursed;
    const collectionRate =
        kpis.total_expected > 0
            ? Math.round((kpis.total_collected / kpis.total_expected) * 100)
            : 0;

    return (
        <>
            <Head title="Sales Overview" />

            <div className="min-h-screen space-y-6 bg-gray-50 p-6">
                {/* Header + filter */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Sales Overview
                        </h1>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Money in, money out, and what's coming
                        </p>
                    </div>

                    {/* Date filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Presets */}
                        {/* {[
                            { label: '7d', action: () => preset(7) },
                            { label: '30d', action: () => preset(30) },
                            {
                                label: 'This month',
                                action: () => presetMonth(0),
                            },
                            {
                                label: 'Last month',
                                action: () => presetMonth(-1),
                            },
                        ].map(({ label, action }) => (
                            <button
                                key={label}
                                onClick={action}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                            >
                                {label}
                            </button>
                        ))} */}

                        {/* Custom range */}
                        <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5">
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="text-xs text-gray-700 outline-none"
                            />
                            <span className="text-xs text-gray-400">→</span>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="text-xs text-gray-700 outline-none"
                            />
                        </div>
                        <button
                            onClick={applyFilter}
                            className="rounded-xl bg-[#b4e4a1] px-4 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-[#8de26b]"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard
                        title="Total disbursed"
                        value={peso(kpis.total_disbursed)}
                        sub={`${kpis.disbursed_count} loans`}
                        icon="💸"
                        variant="blue"
                    />
                    <StatCard
                        title="Total collected"
                        value={peso(kpis.total_collected)}
                        sub={`${kpis.collected_count} payments`}
                        icon="💰"
                        variant="green"
                    />
                    <StatCard
                        title="Expected collections"
                        value={peso(kpis.total_expected)}
                        sub={`${kpis.expected_count} schedules · ${collectionRate}% collected`}
                        icon="📅"
                        variant="blue"
                    />
                    <StatCard
                        title="Total overdue"
                        value={peso(kpis.total_overdue)}
                        sub={`${kpis.overdue_count} schedules`}
                        icon="⚠️"
                        variant="green"
                    />
                </div>

                {/* Net flow callout */}
                <div
                    className={`flex items-center justify-between rounded-2xl px-6 py-4 ${netFlow >= 0 ? 'bg-[#b4e4a1]' : 'bg-red-100'}`}
                >
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                            Net cash flow (collected − disbursed)
                        </p>
                        <p
                            className={`mt-1 text-3xl font-bold ${netFlow >= 0 ? 'text-gray-800' : 'text-red-700'}`}
                        >
                            {netFlow >= 0 ? '+' : ''}
                            {peso(netFlow)}
                        </p>
                    </div>
                    <span className="text-4xl opacity-30">
                        {netFlow >= 0 ? '📈' : '📉'}
                    </span>
                </div>

                {/* Disbursed vs Collected area chart */}
                <Panel title="Daily disbursed vs collected">
                    <div className="px-5 pb-5">
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart
                                data={dailySeries}
                                margin={{
                                    top: 4,
                                    right: 8,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="gDisbursed"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#c3d9eb"
                                            stopOpacity={0.6}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#c3d9eb"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="gCollected"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#b4e4a1"
                                            stopOpacity={0.6}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#b4e4a1"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f5f5f5"
                                />
                                <XAxis
                                    dataKey="day"
                                    tickFormatter={fmtDay}
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
                                    labelFormatter={fmtDay}
                                    formatter={(v, name) => [
                                        peso(v),
                                        name === 'disbursed'
                                            ? 'Disbursed'
                                            : 'Collected',
                                    ]}
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
                                <Area
                                    type="monotone"
                                    dataKey="disbursed"
                                    stroke="#378ADD"
                                    strokeWidth={2}
                                    fill="url(#gDisbursed)"
                                    dot={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="collected"
                                    stroke="#1D9E75"
                                    strokeWidth={2}
                                    fill="url(#gCollected)"
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>

            </div>
        </>
    );
}
