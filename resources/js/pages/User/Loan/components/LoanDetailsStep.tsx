import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PhilippinePeso, Info } from 'lucide-react';

const INTEREST_TYPES = ['percentage', 'flat'];
const INTEREST_PERIODS = ['monthly', 'annually', 'per_term'];
const DURATION_UNITS = ['days', 'weeks', 'months', 'years'];
const PAYMENT_FREQUENCIES = ['daily', 'weekly', 'bi-weekly', 'monthly'];

export default function LoanDetailsStep({ data, onChange, onNext, onBack }) {
    const handleChange = (field) => (e) =>
        onChange({ ...data, [field]: e.target.value });

    const handleSelect = (field) => (value) =>
        onChange({ ...data, [field]: value });

    // const isValid =
    //     data.amount &&
    //     data.interest_type &&
    //     data.interest_value &&
    //     data.interest_period &&
    //     data.loan_duration &&
    //     data.duration_unit &&
    //     data.payment_frequency &&
    //     data.transaction_date;

    const isValid = true;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Loan Details</h2>
                <p className="mt-1 text-sm text-[#acacac]">
                    Set the terms of your loan. These details will be reflected
                    in your contract.
                </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Loan Amount</Label>
                <div className="relative">
                    <PhilippinePeso className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#acacac]" />
                    <Input
                        type="number"
                        placeholder="50,000"
                        value={data.amount || ''}
                        onChange={handleChange('amount')}
                        min={1000}
                        max={100000}
                        className="rounded-lg border-[#e5e5e5] pl-9 focus-visible:ring-secondary"
                    />
                </div>
                <p className="flex items-center gap-1 text-xs text-[#acacac]">
                    <Info className="size-3" /> Min: $1,000 — Max: $100,000
                </p>
            </div>

            {/* Interest */}
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Interest Type</Label>
                    <Select
                        value={data.interest_type || ''}
                        onValueChange={handleSelect('interest_type')}
                    >
                        <SelectTrigger className="w-full rounded-lg border-[#e5e5e5] capitalize focus:ring-secondary">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {INTEREST_TYPES.map((t) => (
                                <SelectItem
                                    key={t}
                                    value={t}
                                    className="capitalize"
                                >
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Interest Value
                    </Label>
                    <Input
                        type="number"
                        placeholder={
                            data.interest_type === 'percentage' ? '2' : '500'
                        }
                        value={data.interest_value || ''}
                        onChange={handleChange('interest_value')}
                        className="rounded-lg border-[#e5e5e5] focus-visible:ring-secondary"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Interest Period
                    </Label>
                    <Select
                        value={data.interest_period || ''}
                        onValueChange={handleSelect('interest_period')}
                    >
                        <SelectTrigger className="w-full rounded-lg border-[#e5e5e5] capitalize focus:ring-secondary">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            {INTEREST_PERIODS.map((p) => (
                                <SelectItem
                                    key={p}
                                    value={p}
                                    className="capitalize"
                                >
                                    {p.replace('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Loan Duration</Label>
                    <Input
                        type="number"
                        placeholder="12"
                        value={data.loan_duration || ''}
                        onChange={handleChange('loan_duration')}
                        className="rounded-lg border-[#e5e5e5] focus-visible:ring-secondary"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Duration Unit</Label>
                    <Select
                        value={data.duration_unit || ''}
                        onValueChange={handleSelect('duration_unit')}
                    >
                        <SelectTrigger className="w-full rounded-lg border-[#e5e5e5] capitalize focus:ring-secondary">
                            <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {DURATION_UNITS.map((u) => (
                                <SelectItem
                                    key={u}
                                    value={u}
                                    className="capitalize"
                                >
                                    {u}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Payment Frequency
                    </Label>
                    <Select
                        value={data.payment_frequency || ''}
                        onValueChange={handleSelect('payment_frequency')}
                    >
                        <SelectTrigger className="w-full rounded-lg border-[#e5e5e5] capitalize focus:ring-secondary">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_FREQUENCIES.map((f) => (
                                <SelectItem
                                    key={f}
                                    value={f}
                                    className="capitalize"
                                >
                                    {f}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Transaction Date
                    </Label>
                    <Input
                        type="date"
                        value={data.transaction_date || ''}
                        onChange={handleChange('transaction_date')}
                        className="rounded-lg border-[#e5e5e5] focus-visible:ring-secondary"
                    />
                </div>
            </div>

            <div className="flex justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="rounded-full border-[#e0e0e0] px-8 py-5 text-sm font-bold"
                >
                    ← Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                    className="rounded-full bg-accent px-8 py-5 text-sm font-bold text-white hover:bg-accent/85 disabled:opacity-40"
                >
                    Continue →
                </Button>
            </div>
        </div>
    );
}
