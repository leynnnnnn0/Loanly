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
import { UserPlus, Trash2, Users } from 'lucide-react';

const RELATIONSHIPS = [
    'Parent',
    'Sibling',
    'Spouse',
    'Child',
    'Relative',
    'Friend',
    'Colleague',
    'Employer',
    'Neighbor',
    'Other',
];

const emptyRef = () => ({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    relationship: '',
});

export default function ReferencesStep({ data, onChange, onNext, onBack }) {
    const refs = data.length > 0 ? data : [emptyRef(), emptyRef(), emptyRef()];

    const updateRef = (index, field, value) => {
        const updated = refs.map((r, i) =>
            i === index ? { ...r, [field]: value } : r,
        );
        onChange(updated);
    };

    const addRef = () => onChange([...refs, emptyRef()]);

    const removeRef = (index) => {
        if (refs.length <= 3) return;
        onChange(refs.filter((_, i) => i !== index));
    };

    const isRefComplete = (r) =>
        r.first_name &&
        r.last_name &&
        r.phone_number &&
        r.address &&
        r.relationship;

    // const isValid = refs.length >= 3 && refs.slice(0, 3).every(isRefComplete);

    const isValid = true;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">References</h2>
                <p className="mt-1 text-sm text-[#acacac]">
                    Provide at least 3 personal references. They may be
                    contacted during the loan review process.
                </p>
            </div>

            <div className="space-y-5">
                {refs.map((ref, index) => (
                    <div
                        key={index}
                        className="space-y-4 rounded-xl border border-[#ebebeb] p-5"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                                    {index + 1}
                                </div>
                                <span className="text-sm font-semibold">
                                    Reference {index + 1}
                                    {index < 3 && (
                                        <span className="ml-1 text-xs font-normal text-[#acacac]">
                                            (required)
                                        </span>
                                    )}
                                </span>
                            </div>
                            {refs.length > 3 && (
                                <button
                                    onClick={() => removeRef(index)}
                                    className="text-red-400 transition-colors hover:text-red-600"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            )}
                        </div>

                        {/* Name */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-[#7e7e7e]">
                                    First Name
                                </Label>
                                <Input
                                    placeholder="Juan"
                                    value={ref.first_name}
                                    onChange={(e) =>
                                        updateRef(
                                            index,
                                            'first_name',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-lg border-[#e5e5e5] text-sm focus-visible:ring-accent"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-[#7e7e7e]">
                                    Last Name
                                </Label>
                                <Input
                                    placeholder="Dela Cruz"
                                    value={ref.last_name}
                                    onChange={(e) =>
                                        updateRef(
                                            index,
                                            'last_name',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-lg border-[#e5e5e5] text-sm focus-visible:ring-accent"
                                />
                            </div>
                        </div>

                        {/* Phone + Relationship */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-[#7e7e7e]">
                                    Phone Number
                                </Label>
                                <Input
                                    placeholder="+63 912 345 6789"
                                    value={ref.phone_number}
                                    onChange={(e) =>
                                        updateRef(
                                            index,
                                            'phone_number',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-lg border-[#e5e5e5] text-sm focus-visible:ring-accent"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-[#7e7e7e]">
                                    Relationship
                                </Label>
                                <Select
                                    value={ref.relationship}
                                    onValueChange={(v) =>
                                        updateRef(index, 'relationship', v)
                                    }
                                >
                                    <SelectTrigger className="w-full rounded-lg border-[#e5e5e5] text-sm focus:ring-accent">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RELATIONSHIPS.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-[#7e7e7e]">
                                Address
                            </Label>
                            <Input
                                placeholder="Street, Barangay, City"
                                value={ref.address}
                                onChange={(e) =>
                                    updateRef(index, 'address', e.target.value)
                                }
                                className="rounded-lg border-[#e5e5e5] text-sm focus-visible:ring-accent"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add more */}
            <button
                onClick={addRef}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e0e0e0] py-3 text-sm font-medium text-[#acacac] transition-all hover:border-accent/30 hover:text-accent"
            >
                <UserPlus className="size-4" />
                Add Another Reference
            </button>

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
