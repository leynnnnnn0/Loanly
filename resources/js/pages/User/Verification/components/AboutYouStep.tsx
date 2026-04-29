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
import { CalendarDays, Globe, User, Phone, MapPin } from 'lucide-react';

const NATIONALITIES = [
    'Filipino',
    'American',
    'British',
    'Australian',
    'Canadian',
    'Japanese',
    'Korean',
    'Chinese',
    'Singaporean',
    'Malaysian',
    'Indonesian',
    'Thai',
    'Vietnamese',
    'Indian',
    'Other',
];

export default function AboutYouStep({ data, onChange, onNext }: any) {
    const set = (field) => (val) =>
        onChange({ ...data, [field]: val?.target ? val.target.value : val });

    const isValid =
        data.first_name &&
        data.last_name &&
        data.phone_number &&
        data.address &&
        data.date_of_birth &&
        data.nationality;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <p className="text-xs font-semibold tracking-widest text-[#acacac] uppercase">
                    Step 1 of 4
                </p>
                <h2 className="text-2xl font-semibold">
                    Tell us about yourself
                </h2>
                <p className="text-sm text-[#acacac]">
                    A few personal details to get you started on your loan
                    application.
                </p>
            </div>

            <div className="space-y-5">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-black/70">
                            First Name <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                            <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#c0c0c0]" />
                            <Input
                                placeholder="Juan"
                                value={data.first_name || ''}
                                onChange={set('first_name')}
                                className="rounded-xl border-[#e8e8e8] pl-10 focus-visible:ring-black"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-black/70">
                            Last Name <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                            <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#c0c0c0]" />
                            <Input
                                placeholder="Dela Cruz"
                                value={data.last_name || ''}
                                onChange={set('last_name')}
                                className="rounded-xl border-[#e8e8e8] pl-10 focus-visible:ring-black"
                            />
                        </div>
                    </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-black/70">
                        Phone Number <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                        <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#c0c0c0]" />
                        <Input
                            placeholder="+63 912 345 6789"
                            value={data.phone_number || ''}
                            onChange={set('phone_number')}
                            className="rounded-xl border-[#e8e8e8] pl-10 focus-visible:ring-black"
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-black/70">
                        Address <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                        <MapPin className="absolute top-3 left-3 size-4 text-[#c0c0c0]" />
                        <textarea
                            placeholder="Street, Barangay, City, Province"
                            value={data.address || ''}
                            onChange={set('address')}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-[#e8e8e8] py-2 pr-4 pl-10 text-sm outline-none placeholder:text-[#c0c0c0] focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-black/70">
                        Date of Birth <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                        <CalendarDays className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#c0c0c0]" />
                        <Input
                            type="date"
                            value={data.date_of_birth || ''}
                            onChange={set('date_of_birth')}
                            className="rounded-xl border-[#e8e8e8] pl-10 focus-visible:ring-black"
                        />
                    </div>
                    <p className="text-xs text-[#acacac]">
                        You must be at least 18 years old to apply.
                    </p>
                </div>

                {/* Nationality */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-black/70">
                        Nationality <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                        <Globe className="absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#c0c0c0]" />
                        <Select
                            value={data.nationality || ''}
                            onValueChange={set('nationality')}
                        >
                            <SelectTrigger className="w-full rounded-xl border-[#e8e8e8] pl-10 focus:ring-black">
                                <SelectValue placeholder="Select your nationality" />
                            </SelectTrigger>
                            <SelectContent>
                                {NATIONALITIES.map((n) => (
                                    <SelectItem key={n} value={n}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
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
