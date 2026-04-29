import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    PhilippinePeso,
    Calendar,
    Clock,
    Percent,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function LoanSummary({ loanData, onSubmit, isLastStep }) {
    const [agreed, setAgreed] = useState(false);

    const {
        amount = 0,
        interest_type = '—',
        interest_value = 0,
        interest_period = '—',
        loan_duration = 0,
        duration_unit = '—',
        payment_frequency = '—',
        transaction_date = '—',
    } = loanData || {};

    const interestAmount =
        interest_type === 'percentage'
            ? (amount * interest_value) / 100
            : interest_value;

    const totalPayable = amount + interestAmount;

    const rows = [
        {
            label: 'Loan Amount',
            value: amount ? `$${Number(amount).toLocaleString()}.00` : '—',
        },
        { label: 'Interest Type', value: interest_type || '—' },
        {
            label: 'Interest Value',
            value: interest_value
                ? `${interest_value}${interest_type === 'percentage' ? '%' : ' flat'}`
                : '—',
        },
        {
            label: 'Duration',
            value: loan_duration ? `${loan_duration} ${duration_unit}` : '—',
        },
        { label: 'Payment Frequency', value: payment_frequency || '—' },
        { label: 'Transaction Date', value: transaction_date || '—' },
    ];

    return (
        <div className="sticky top-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Loan Summary</h3>
            <Separator />

            <div className="space-y-3">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-start justify-between gap-4"
                    >
                        <span className="text-sm text-[#acacac]">
                            {row.label}
                        </span>
                        <span className="text-right text-sm font-medium text-black">
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>

            <Separator />

            <div className="space-y-1 rounded-lg bg-secondary p-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-black/60">Interest</span>
                    <span className="text-sm font-bold">
                        {amount
                            ? `+$${interestAmount.toLocaleString()}.00`
                            : '—'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-bold">Total Payable</span>
                    <span className="text-xl font-bold">
                        {amount ? `$${totalPayable.toLocaleString()}.00` : '—'}
                    </span>
                </div>
            </div>

            {isLastStep && (
                <>
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                        <p className="text-xs leading-relaxed text-amber-700">
                            Your loan application will be reviewed. We'll hold
                            your request until it's approved.
                        </p>
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="terms"
                            checked={agreed}
                            onCheckedChange={setAgreed}
                            className="mt-0.5"
                        />
                        <label
                            htmlFor="terms"
                            className="cursor-pointer text-xs leading-relaxed text-black/60"
                        >
                            I agree to the{' '}
                            <span className="font-semibold text-black underline underline-offset-2">
                                Terms & Conditions
                            </span>{' '}
                            and{' '}
                            <span className="font-semibold text-black underline underline-offset-2">
                                Privacy Policy
                            </span>
                        </label>
                    </div>

                    <Button
                        onClick={onSubmit}
                        disabled={!agreed}
                        className="w-full rounded-full bg-black py-5 text-sm font-bold text-white hover:bg-black/85 disabled:opacity-40"
                    >
                        Submit Loan Application
                    </Button>
                </>
            )}
        </div>
    );
}
