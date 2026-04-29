import Navbar from '@/components/Navbar';
import { useState, useMemo } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    PhilippinePeso,
    Calendar,
    Info,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ScheduleRow {
    term: number;
    dueDate: string;
    principal: number;
    interest: number;
    total: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(v);

function addPeriod(date: Date, n: number, unit: 'weeks' | 'months'): Date {
    const d = new Date(date);
    if (unit === 'months') d.setMonth(d.getMonth() + n);
    else d.setDate(d.getDate() + n * 7);
    return d;
}

function formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

/**
 * Total number of payment instalments:
 *   - monthly frequency → loanDurationMonths payments
 *   - weekly  frequency → loanDurationMonths × 4 payments
 */
function totalTerms(
    loanDurationMonths: number,
    frequency: 'monthly' | 'weekly',
): number {
    return frequency === 'weekly' ? loanDurationMonths * 4 : loanDurationMonths;
}

function computeSchedule(
    amount: number,
    interestValue: number, // always percentage, fixed at 2
    loanDurationMonths: number, // 1–3 months
    frequency: 'monthly' | 'weekly',
    transactionDate: string,
): ScheduleRow[] {
    if (!amount || !loanDurationMonths || !transactionDate) return [];

    const terms = totalTerms(loanDurationMonths, frequency);
    const start = new Date(transactionDate);

    // 2% per month interest → total interest = principal × rate × months
    const monthlyRate = interestValue / 100;
    const totalInterest = amount * monthlyRate * loanDurationMonths;

    const principalPerTerm = amount / terms;
    const interestPerTerm = totalInterest / terms;

    const unit = frequency === 'weekly' ? 'weeks' : 'months';

    return Array.from({ length: terms }, (_, i) => ({
        term: i + 1,
        dueDate: formatDate(addPeriod(start, i + 1, unit)),
        principal: Math.round(principalPerTerm * 100) / 100,
        interest: Math.round(interestPerTerm * 100) / 100,
        total: Math.round((principalPerTerm + interestPerTerm) * 100) / 100,
    }));
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Create() {
    const { borrower, maxBorrow, availableToBorrow } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        interest_type: 'percentage', // locked
        interest_value: '2', // locked
        interest_period: 'monthly', // locked
        loan_duration: '1', // 1–3 months
        duration_unit: 'months', // locked
        transaction_date: new Date().toISOString().split('T')[0],
        reason: '',
        payment_frequency: 'monthly' as 'monthly' | 'weekly',
    });

    const schedule = useMemo(
        () =>
            computeSchedule(
                parseFloat(data.amount) || 0,
                parseFloat(data.interest_value) || 2,
                parseInt(data.loan_duration) || 1,
                data.payment_frequency as 'monthly' | 'weekly',
                data.transaction_date,
            ),
        [
            data.amount,
            data.interest_value,
            data.loan_duration,
            data.payment_frequency,
            data.transaction_date,
        ],
    );

    const totalRepayment = schedule.reduce((s, r) => s + r.total, 0);
    const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/user/my-loans');
    }

    return (
        <div className="min-h-screen space-y-8 bg-[#FCFCFC] px-50 pb-20">
            <Navbar />

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/user/my-loans"
                    className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-black hover:text-white"
                >
                    <ChevronLeft className="size-4" />
                </Link>
                <div>
                    <h3 className="text-3xl font-medium">Apply for a Loan</h3>
                    <p className="text-sm text-[#acacac]">
                        Fill in the details below and preview your payment
                        schedule
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-3 gap-6">
                    {/* ── Left: Form ─────────────────────────────── */}
                    <div className="col-span-2 space-y-6">
                        {/* Loan Details Card */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h4 className="mb-5 text-lg font-semibold">
                                Loan Details
                            </h4>

                            {/* Amount */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-black/70">
                                    Loan Amount
                                </label>
                                <div className="flex items-center rounded-lg border border-black/10 bg-[#f5f5f5] px-4 py-2.5">
                                    <span className="mr-2 text-black/40">
                                        ₱
                                    </span>
                                    <input
                                        type="number"
                                        min={1000}
                                        max={availableToBorrow}
                                        step={100}
                                        value={data.amount}
                                        onChange={(e) =>
                                            setData('amount', e.target.value)
                                        }
                                        placeholder="e.g. 5000"
                                        className="w-full bg-transparent text-sm outline-none placeholder:text-black/30"
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.amount}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-black/40">
                                    Min: $1,000 &nbsp;·&nbsp; Available:{' '}
                                    {fmt(availableToBorrow)}
                                </p>
                            </div>

                            {/* Reason */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-black/70">
                                    Purpose / Reason
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                    placeholder="Briefly describe why you need this loan..."
                                    className="w-full resize-none rounded-lg border border-black/10 bg-[#f5f5f5] px-4 py-2.5 text-sm outline-none placeholder:text-black/30"
                                />
                                {errors.reason && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            {/* Transaction Date */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-black/70">
                                    Transaction Date
                                </label>
                                <input
                                    disabled
                                    type="date"
                                    value={data.transaction_date}
                                    className="w-full rounded-lg border border-black/10 bg-[#f5f5f5] px-4 py-2.5 text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Interest & Terms Card */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h4 className="mb-5 text-lg font-semibold">
                                Interest & Terms
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Interest Type — locked display */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-black/70">
                                        Interest Type
                                    </label>
                                    <div className="flex items-center rounded-lg border border-black/10 bg-[#f0f0f0] px-4 py-2.5 text-sm text-black/50">
                                        Percentage (%)
                                    </div>
                                </div>

                                {/* Interest Value — locked display */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-black/70">
                                        Interest Rate
                                    </label>
                                    <div className="flex items-center rounded-lg border border-black/10 bg-[#f0f0f0] px-4 py-2.5 text-sm text-black/50">
                                        2% per month
                                    </div>
                                </div>

                                {/* Payment Frequency */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-black/70">
                                        Payment Frequency
                                    </label>
                                    <select
                                        value={data.payment_frequency}
                                        onChange={(e) =>
                                            setData(
                                                'payment_frequency',
                                                e.target.value as
                                                    | 'monthly'
                                                    | 'weekly',
                                            )
                                        }
                                        className="w-full rounded-lg border border-black/10 bg-[#f5f5f5] px-4 py-2.5 text-sm outline-none"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>

                                {/* Loan Duration — 1 to 3 months */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-black/70">
                                        Loan Duration (months)
                                    </label>
                                    <select
                                        value={data.loan_duration}
                                        onChange={(e) =>
                                            setData(
                                                'loan_duration',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-black/10 bg-[#f5f5f5] px-4 py-2.5 text-sm outline-none"
                                    >
                                        <option value="1">1 month</option>
                                        <option value="2">2 months</option>
                                        <option value="3">3 months</option>
                                    </select>
                                    {errors.loan_duration && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.loan_duration}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Payment Schedule Preview ──────────────── */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <h4 className="text-lg font-semibold">
                                    Payment Schedule Preview
                                </h4>
                                {schedule.length > 0 && (
                                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
                                        {schedule.length} payment
                                        {schedule.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {schedule.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#f5f5f5]">
                                        <Calendar className="size-5 text-black/20" />
                                    </div>
                                    <p className="text-sm text-black/40">
                                        Fill in loan details to preview the
                                        schedule
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border border-black/5">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-black/5 bg-[#f9f9f9]">
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-black/50">
                                                    #
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-black/50">
                                                    Due Date
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-black/50">
                                                    Principal
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-black/50">
                                                    Interest
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-black/50">
                                                    Total Due
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedule.map((row, idx) => (
                                                <tr
                                                    key={row.term}
                                                    className={`border-b border-black/5 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}
                                                >
                                                    <td className="px-4 py-3 text-black/40">
                                                        {row.term}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {row.dueDate}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-black/60">
                                                        {fmt(row.principal)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-black/60">
                                                        {fmt(row.interest)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold">
                                                        {fmt(row.total)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-black/10 bg-[#f5f5f5]">
                                                <td
                                                    colSpan={2}
                                                    className="px-4 py-3 text-xs font-semibold text-black/50"
                                                >
                                                    TOTAL
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold">
                                                    {fmt(
                                                        parseFloat(
                                                            data.amount,
                                                        ) || 0,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold">
                                                    {fmt(totalInterest)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-bold">
                                                    {fmt(totalRepayment)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right: Summary Sidebar ──────────────────── */}
                    <div className="space-y-5">
                        {/* Loan Summary */}
                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <h4 className="mb-4 font-semibold">Loan Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-black/50">
                                        Principal
                                    </span>
                                    <span className="text-sm font-medium">
                                        {data.amount
                                            ? fmt(parseFloat(data.amount))
                                            : '—'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-black/50">
                                        Total Interest
                                    </span>
                                    <span className="text-sm font-medium">
                                        {schedule.length
                                            ? fmt(totalInterest)
                                            : '—'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-black/50">
                                        Total Repayment
                                    </span>
                                    <span className="text-sm font-bold">
                                        {schedule.length
                                            ? fmt(totalRepayment)
                                            : '—'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-black/50">
                                        Per Payment
                                    </span>
                                    <span className="text-sm font-bold">
                                        {schedule.length
                                            ? fmt(schedule[0].total)
                                            : '—'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-black/50">
                                        Duration
                                    </span>
                                    <span className="text-sm font-medium">
                                        {data.loan_duration} month
                                        {parseInt(data.loan_duration) > 1
                                            ? 's'
                                            : ''}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-black/50">
                                        Frequency
                                    </span>
                                    <span className="text-sm font-medium capitalize">
                                        {data.payment_frequency}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-black/50">
                                        No. of Payments
                                    </span>
                                    <span className="text-sm font-medium">
                                        {schedule.length || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="rounded-xl bg-primary p-5">
                            <div className="mb-2 flex items-center gap-1.5">
                                <PhilippinePeso className="size-4" />
                                <h4 className="text-sm font-semibold">
                                    Credit Limit
                                </h4>
                            </div>
                            <p className="text-2xl font-bold">
                                {fmt(availableToBorrow)}
                            </p>
                            <p className="text-xs text-black/50">
                                available to borrow
                            </p>
                            <div className="mt-3 h-1.5 w-full rounded-full bg-black/10">
                                <div
                                    className="h-1.5 rounded-full bg-black/40 transition-all"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            (parseFloat(data.amount || '0') /
                                                availableToBorrow) *
                                                100,
                                        )}%`,
                                    }}
                                />
                            </div>
                            {data.amount && (
                                <p className="mt-1 text-xs text-black/50">
                                    {fmt(parseFloat(data.amount))} of{' '}
                                    {fmt(availableToBorrow)} requested
                                </p>
                            )}
                        </div>

                        {/* Notice */}
                        <div className="flex gap-2 rounded-xl bg-yellow-50 p-4">
                            <Info className="mt-0.5 size-4 shrink-0 text-yellow-600" />
                            <p className="text-xs text-yellow-700">
                                Your application will be reviewed within 5
                                minutes to 24 hours. The schedule above is a
                                preview and may be adjusted upon approval.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={
                                processing || !data.amount || !data.reason
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-all hover:bg-black/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {processing ? 'Submitting…' : 'Submit Application'}
                            {!processing && <ChevronRight className="size-4" />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
