import { Link } from '@inertiajs/react';
import { ShieldAlert, ChevronRight, CircleAlert } from 'lucide-react';
import CreditScoreBadge from './CreditScoreBadge';

interface LowCreditBlockProps {
    borrowerName?: string;
    borrowerId: number;
}

export default function LowCreditBlock({
    borrowerName,
    borrowerId,
}: LowCreditBlockProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFCFC] px-6">
            {/* Icon bubble */}
            <div className="relative mb-8 flex items-center justify-center">
                <span className="absolute inline-flex size-28 rounded-full bg-red-100 opacity-60" />
                <span className="absolute inline-flex size-20 rounded-full bg-red-200 opacity-60" />
                <div className="relative flex size-14 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-200">
                    <ShieldAlert className="size-7 text-white" />
                </div>
            </div>

            {/* Text */}
            <div className="mb-6 max-w-sm text-center">
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-black">
                    Unable to Apply for a Loan
                </h2>
                {borrowerName && (
                    <p className="mb-1 text-sm font-medium text-black/40">
                        Hi, {borrowerName}
                    </p>
                )}
                <p className="text-sm leading-relaxed text-black/50">
                    Your credit score is currently too low to apply for a new
                    loan. Please settle your pending loans and ensure payments
                    are made on or before the due date to restore your
                    eligibility.
                </p>
            </div>

            {/* Credit Score Card */}
            <div className="mb-6 w-full max-w-sm">
                <CreditScoreBadge
                    borrowerId={borrowerId}
                    showBreakdown
                    className="shadow-sm"
                />
            </div>

            {/* Minimum score notice */}
            <div className="mb-6 w-full max-w-sm rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-center text-xs text-red-500">
                    Minimum score required to apply:{' '}
                    <span className="font-bold">600</span>
                </p>
            </div>

            {/* Tips card */}
            <div className="mb-8 w-full max-w-sm rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs font-semibold tracking-widest text-black/30 uppercase">
                    How to improve your score
                </p>
                <ul className="space-y-3">
                    {[
                        'Pay your outstanding loans immediately',
                        'Always pay on or before the due date',
                        'Avoid missing scheduled payments',
                        'Settle the full amount when possible',
                    ].map((tip) => (
                        <li key={tip} className="flex items-start gap-2.5">
                            <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-400" />
                            <span className="text-sm text-black/60">{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* CTA */}
            <Link
                href="/user/my-loans"
                className="flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-bold text-white transition-all hover:bg-black/80 active:scale-95"
            >
                View My Loans
                <ChevronRight className="size-4" />
            </Link>

            <p className="mt-4 text-xs text-black/30">
                Questions? Contact your loan officer for assistance.
            </p>
        </div>
    );
}
