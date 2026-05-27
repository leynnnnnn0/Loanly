import { Link,usePage } from '@inertiajs/react';
import { ChevronRight,Lock,PhilippinePeso,Search } from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Building from '../../../../../public/images/building.png';
import Mansion from '../../../../../public/images/mansion.png';

const IMAGES = [Building, Mansion];

function LoanCard({ loan }: any) {
    const isPrimary = loan.variant === 'primary';
    const bg = isPrimary ? 'bg-primary' : 'bg-secondary';
    const img = IMAGES[loan.id % 2];

    const fmt = (v: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(v);

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300">
            <section className="grid gap-0 sm:min-h-52 sm:grid-cols-7">
                <div
                    className={`flex flex-col justify-between gap-5 p-5 sm:col-span-3 sm:rounded-l-xl sm:rounded-tr-[60px] ${bg}`}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-black/70">
                            {loan.contract_number}
                        </h3>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                loan.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : loan.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : loan.status === 'rejected'
                                        ? 'bg-red-100 text-red-500'
                                        : loan.status === 'voided'
                                          ? 'bg-orange-100 text-orange-500'
                                          : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            {loan.status}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-sm text-black/50">Loan Amount</h3>
                        <h1 className="text-2xl font-bold">
                            {fmt(loan.amount)}
                        </h1>
                    </div>
                    <div>
                        <h3 className="text-sm text-black/50">
                            Remaining Amount
                        </h3>
                        <h1 className="text-2xl font-bold">
                            {fmt(loan.remaining)}
                        </h1>
                    </div>
                </div>
                <div className="bg-white sm:h-full">
                    <div className="flex items-center justify-center p-4 sm:h-14 sm:p-0">
                        <Link
                            href={`/user/my-loans/${loan.id}`}
                            className="rounded-full bg-black px-6 py-2 text-xs font-bold text-white transition-all hover:bg-black/80 active:scale-95"
                        >
                            Details
                        </Link>
                    </div>
                    <div className={`flex flex-col justify-center gap-2 p-4 sm:h-38 sm:px-3 ${bg}`}>
                        <div>
                            <h3 className="text-xs text-black/50">Terms</h3>
                            <h1 className="text-lg font-bold">
                                {loan.terms} {loan.duration_unit}
                            </h1>
                        </div>
                        <div>
                            <h3 className="text-xs text-black/50">Next Due</h3>
                            <h1 className="text-lg font-bold">
                                {loan.monthly_due > 0
                                    ? fmt(loan.monthly_due)
                                    : '—'}
                            </h1>
                        </div>
                    </div>
                </div>
                <div
                    className={`relative min-h-48 overflow-hidden sm:col-span-3 sm:h-full sm:rounded-tl-[60px] sm:rounded-r-xl ${bg}`}
                >
                    <img
                        src={img}
                        className="absolute h-full w-full object-cover"
                        alt="Property"
                    />
                </div>
            </section>
        </div>
    );
}

export default function Index() {
    const { isVerified, loans, summaries } = usePage().props as any;

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filters = ['all', 'active', 'pending', 'completed', 'rejected', 'voided'];

    const filtered = (loans as any[]).filter((l) => {
        const matchesSearch = l.contract_number
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || l.status === filter;

        return matchesSearch && matchesFilter;
    });

    const fmt = (v: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(v);

    const summaryCards = [
        { id: 1, label: 'Total Loaned', value: summaries.total_loaned },
        { id: 2, label: 'Total Remaining', value: summaries.total_remaining },
        { id: 3, label: 'Total Paid', value: summaries.total_paid },
    ];

    const activeCount = (loans as any[]).filter(
        (l) => l.status === 'active',
    ).length;

    return (
        <div className="min-h-screen space-y-8 bg-[#FCFCFC] px-4 pb-16 sm:px-6 lg:px-12 xl:px-24 2xl:px-50">
            <Navbar />

            <div className="space-y-1">
                <h3 className="text-3xl font-medium">My Loans</h3>
                <p className="text-sm text-[#acacac]">
                    You have {activeCount} active loan
                    {activeCount !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 md:gap-5">
                {summaryCards.map((item) => (
                    <section
                        key={item.id}
                        className={`space-y-3 rounded-lg p-5 ${
                            item.id % 2 === 0 ? 'bg-primary' : 'bg-secondary'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex size-10 items-center justify-center rounded-full bg-white">
                                <PhilippinePeso className="size-4 font-bold" />
                            </div>
                            <h3 className="text-sm font-bold">{item.label}</h3>
                        </div>
                        <h1 className="break-words text-2xl font-bold lg:text-3xl">
                            {fmt(item.value)}
                        </h1>
                    </section>
                ))}
            </div>

            {/* Apply Banner */}
            <div className="flex flex-col gap-4 rounded-xl bg-[#f5f5f5] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-bold">Need a new loan?</h3>
                    <p className="text-sm text-black/50">
                        Get up to ₱20,000 in minutes
                    </p>
                </div>
                {isVerified ? (
                    <Link
                        href="/user/my-loans/apply"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-black/80 active:scale-95 sm:w-auto"
                    >
                        Apply Now <ChevronRight className="size-4" />
                    </Link>
                ) : (
                    <div className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-black/20 px-6 py-2.5 text-sm font-bold text-black/40 sm:w-auto">
                        <Lock className="size-4" />
                        Account Not Verified
                    </div>
                )}
            </div>

            {/* Loans Table */}
            <div className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <h3 className="text-xl font-medium">All Loans</h3>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-[#f5f5f5] px-3 py-1.5">
                            <Search className="size-3.5 text-black/40" />
                            <input
                                type="text"
                                placeholder="Search by contract no..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent text-xs outline-none placeholder:text-black/30 lg:w-44"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-black/10 bg-[#f5f5f5] p-1 sm:rounded-full">
                            {filters.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all ${
                                        filter === f
                                            ? 'bg-black text-white'
                                            : 'text-black/50 hover:text-black'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    {filtered.length > 0 ? (
                        filtered.map((loan: any) => (
                            <LoanCard key={loan.id} loan={loan} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-[#f5f5f5]">
                                <PhilippinePeso className="size-6 text-black/20" />
                            </div>
                            <h3 className="font-medium text-black/50">
                                No loans found
                            </h3>
                            <p className="text-sm text-black/30">
                                Try adjusting your search or filter
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
