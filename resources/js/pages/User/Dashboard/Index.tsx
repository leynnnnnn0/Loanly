import Building from '../../../../../public/images/building.png';
import Mansion from '../../../../../public/images/mansion.png';
import { PhilippinePeso, ChevronRight, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import { Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { borrower, isVerified, loans, summaries, activeCount } = usePage()
        .props as any;

    const summaryCards = [
        {
            id: 1,
            label: 'Total Loan Amount',
            value: summaries.total_loan_amount,
        },
        { id: 2, label: 'This Month Due', value: summaries.this_month_due },
        {
            id: 3,
            label: 'Total Remaining Amount',
            value: summaries.total_remaining,
        },
    ];

    const fmt = (v: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
        }).format(v);

    const images = [Building, Mansion];

    return (
        <div className="space-y-10 bg-[#FCFCFC] px-50 pb-20">
            <Navbar />
            <div className="grid grid-cols-3 gap-5">
                {/* LEFT COLUMN */}
                <div className="col-span-2 space-y-3">
                    <h3 className="text-3xl font-medium">
                        Get Loans in Minutes!
                    </h3>
                    <h6 className="text-sm text-[#acacac]">
                        {activeCount > 0
                            ? `You currently have ${activeCount} active loan${activeCount > 1 ? 's' : ''}`
                            : 'You have no active loans'}
                    </h6>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-5">
                        {summaryCards.map((item) => (
                            <section
                                key={item.id}
                                className={`space-y-3 rounded-lg p-5 ${
                                    item.id % 2 === 0
                                        ? 'bg-primary'
                                        : 'bg-secondary'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-white">
                                        <PhilippinePeso className="font-bold" />
                                    </div>
                                    <h3 className="text-normal font-bold">
                                        {item.label}
                                    </h3>
                                </div>
                                <h1 className="text-3xl font-bold">
                                    {fmt(item.value)}
                                </h1>
                            </section>
                        ))}
                    </div>

                    {/* Latest Loans */}
                    <div className="mt-5 h-fit rounded-lg bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-medium">
                                Latest Loans
                            </h3>
                            <Link
                                href="/user/my-loans"
                                className="text-sm text-[#acacac]"
                            >
                                See All
                            </Link>
                        </div>

                        {loans.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-[#f5f5f5]">
                                    <PhilippinePeso className="size-6 text-black/20" />
                                </div>
                                <h3 className="font-medium text-black/50">
                                    No loans yet
                                </h3>
                                <p className="text-sm text-black/30">
                                    Apply for a loan to get started
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {loans.map((loan: any, idx: number) => {
                                    const isPrimary =
                                        loan.variant === 'primary';
                                    const bg = isPrimary
                                        ? 'bg-primary'
                                        : 'bg-secondary';
                                    const img = images[idx % 2];

                                    return (
                                        <section
                                            key={loan.id}
                                            className="grid h-52 grid-cols-7"
                                        >
                                            <div
                                                className={`col-span-3 flex h-full flex-col justify-between rounded-l-lg rounded-tr-[60px] ${bg} p-5`}
                                            >
                                                <h3 className="font-bold text-black/70">
                                                    {loan.contract_number}
                                                </h3>
                                                <div>
                                                    <h3 className="text-sm text-black/50">
                                                        Loan Amount
                                                    </h3>
                                                    <h1 className="text-2xl font-bold">
                                                        {fmt(loan.amount)}
                                                    </h1>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm text-black/50">
                                                        Remaining Amount to Pay
                                                    </h3>
                                                    <h1 className="text-2xl font-bold">
                                                        {fmt(loan.remaining)}
                                                    </h1>
                                                </div>
                                            </div>
                                            <div className="h-full rounded-tr-[100px] bg-white">
                                                <div className="flex h-14 items-center justify-center">
                                                    <Link
                                                        href={`/user/my-loans/${loan.id}`}
                                                        className="rounded-full bg-black px-8 py-2 text-sm font-bold text-white"
                                                    >
                                                        Details
                                                    </Link>
                                                </div>
                                                <div
                                                    className={`flex h-38 flex-col justify-center ${bg}`}
                                                >
                                                    <div>
                                                        <h3 className="text-xs text-black/50">
                                                            Number of Terms
                                                        </h3>
                                                        <h1 className="text-lg font-bold">
                                                            {loan.terms}
                                                        </h1>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs text-black/50">
                                                            Next Due
                                                        </h3>
                                                        <h1 className="text-lg font-bold">
                                                            {loan.monthly_due >
                                                            0
                                                                ? fmt(
                                                                      loan.monthly_due,
                                                                  )
                                                                : '—'}
                                                        </h1>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={`relative col-span-3 h-full rounded-tl-[60px] rounded-r-lg ${bg}`}
                                            >
                                                <img
                                                    src={img}
                                                    className="r-0 absolute h-52 w-full object-cover"
                                                    alt="Building"
                                                />
                                            </div>
                                        </section>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN — Loan Statistics */}
                <div className="h-full space-y-5 rounded-lg bg-white p-5 shadow-lg">
                    <h3 className="text-xl font-medium">Loan Statistics</h3>
                    <div className="flex h-45 flex-col rounded-lg bg-white">
                        <section className="flex flex-1 flex-col items-center justify-center rounded-t-[30px] rounded-b-[30px] bg-primary">
                            <h6 className="text-xs font-medium">Loan up to</h6>
                            <h3 className="text-3xl font-medium">₱20,000.00</h3>
                        </section>
                        <section className="h-18 rounded-t-[30px] rounded-b-[30px] bg-primary">
                            <div className="mx-10 h-1 rounded-full bg-white"></div>
                            <h3 className="mt-3 text-center text-sm font-medium">
                                {fmt(summaries.total_remaining)} / ₱20,000.00
                            </h3>
                            <h6 className="text-center text-[10px] font-medium">
                                Available to Loan
                            </h6>
                        </section>
                    </div>
                    <div className="space-y-3">
                        <section>
                            <h6 className="text-sm">Interest Rate</h6>
                            <h3 className="text-normal font-bold">2%</h3>
                            <Separator className="mt-3" />
                        </section>
                        <section>
                            <h6 className="text-sm">Interest Type</h6>
                            <h3 className="text-normal font-bold">
                                Percentage
                            </h3>
                            <Separator className="mt-3" />
                        </section>
                        <section>
                            <h6 className="text-sm">Payment Terms</h6>
                            <h3 className="text-normal font-bold">
                                Up to 3 months
                            </h3>
                            <Separator className="mt-3" />
                        </section>
                        <section>
                            <h6 className="text-sm">Minimum Loan</h6>
                            <h3 className="text-normal font-bold">
                                ₱1,000.00
                            </h3>
                            <Separator className="mt-3" />
                        </section>
                        <section>
                            <h6 className="text-sm">Valid ID Needed</h6>
                            <h3 className="text-normal font-bold">1</h3>
                            <Separator className="mt-3" />
                        </section>
                        <section>
                            <h6 className="text-sm">Waiting Time</h6>
                            <h3 className="text-normal font-bold">
                                5 minutes to 24 Hours
                            </h3>
                            <Separator className="mt-3" />
                        </section>

                        {isVerified ? (
                            <Link
                                href="/user/my-loans/apply"
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-black/80 active:scale-95"
                            >
                                Apply Now <ChevronRight className="size-4" />
                            </Link>
                        ) : (
                            <div className="mt-2 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-black/20 px-6 py-2.5 text-sm font-bold text-black/40">
                                <Lock className="size-4" />
                                Account Not Verified
                            </div>
                        )}

                        {!isVerified && (
                            <p className="text-center text-xs text-black/40">
                                Your account must be verified before applying
                                for a loan.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
