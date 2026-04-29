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

function ReferenceCard({
    ref: reference,
    index,
    onChange,
    onRemove,
    canRemove,
} : any) {
    const set = (field) => (val) =>
        onChange(index, field, val?.target ? val.target.value : val);

    const isRequired = index < 3;

    return (
        <div className="space-y-4 rounded-2xl border border-[#ebebeb] p-5 transition-all hover:border-black/10">
            {/* Card header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {index + 1}
                    </div>
                    <div>
                        <p className="text-sm font-semibold">
                            Reference {index + 1}
                        </p>
                        {isRequired && (
                            <p className="text-xs text-[#acacac]">Required</p>
                        )}
                    </div>
                </div>
                {canRemove && (
                    <button
                        onClick={() => onRemove(index)}
                        className="flex size-7 items-center justify-center rounded-full text-[#c0c0c0] transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                )}
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/50">
                        First Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        placeholder="Juan"
                        value={reference.first_name}
                        onChange={set('first_name')}
                        className="rounded-xl border-[#e8e8e8] text-sm focus-visible:ring-black"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/50">
                        Last Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        placeholder="Dela Cruz"
                        value={reference.last_name}
                        onChange={set('last_name')}
                        className="rounded-xl border-[#e8e8e8] text-sm focus-visible:ring-black"
                    />
                </div>
            </div>

            {/* Phone + Relationship */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/50">
                        Phone <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        placeholder="+63 912 345 6789"
                        value={reference.phone_number}
                        onChange={set('phone_number')}
                        className="rounded-xl border-[#e8e8e8] text-sm focus-visible:ring-black"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/50">
                        Relationship <span className="text-red-400">*</span>
                    </Label>
                    <Select
                        value={reference.relationship}
                        onValueChange={set('relationship')}
                    >
                        <SelectTrigger className="w-full rounded-xl border-[#e8e8e8] text-sm focus:ring-black">
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
                <Label className="text-xs font-medium text-black/50">
                    Address <span className="text-red-400">*</span>
                </Label>
                <Input
                    placeholder="Street, Barangay, City"
                    value={reference.address}
                    onChange={set('address')}
                    className="rounded-xl border-[#e8e8e8] text-sm focus-visible:ring-black"
                />
            </div>
        </div>
    );
}

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

    const completedCount = refs.filter(isRefComplete).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <p className="text-xs font-semibold tracking-widest text-[#acacac] uppercase">
                    Step 3 of 4
                </p>
                <h2 className="text-2xl font-semibold">Add your references</h2>
                <p className="text-sm text-[#acacac]">
                    Provide at least 3 personal references. They may be
                    contacted during the review process.
                </p>
            </div>


            {/* Reference cards */}
            <div className="space-y-4">
                {refs.map((ref, index) => (
                    <ReferenceCard
                        key={index}
                        ref={ref}
                        index={index}
                        onChange={updateRef}
                        onRemove={removeRef}
                        canRemove={refs.length > 3}
                    />
                ))}
            </div>

            {/* Add more */}
            {/* <button
                onClick={addRef}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#e0e0e0] py-4 text-sm font-medium text-[#acacac] transition-all hover:border-black/25 hover:text-black"
            >
                <UserPlus className="size-4" />
                Add another reference
            </button> */}

            {/* Footer */}
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
