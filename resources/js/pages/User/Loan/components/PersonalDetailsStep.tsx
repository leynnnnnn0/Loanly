import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Phone, MapPin } from 'lucide-react';

export default function PersonalDetailsStep({ data, onChange, onNext } : any) {
    const handleChange = (field) => (e) =>
        onChange({ ...data, [field]: e.target.value });

    // const isValid =
    //     data.first_name && data.last_name && data.phone_number && data.address;

    const isValid = true;
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Personal Details</h2>
                <p className="mt-1 text-sm text-[#acacac]">
                    Tell us about yourself. This info will be used for your loan
                    contract.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">
                        First Name
                    </Label>
                    <div className="relative">
                        <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#acacac]" />
                        <Input
                            id="first_name"
                            placeholder="Juan"
                            value={data.first_name || ''}
                            onChange={handleChange('first_name')}
                            className="rounded-lg border-[#e5e5e5] pl-9 focus-visible:ring-secondary"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">
                        Last Name
                    </Label>
                    <div className="relative">
                        <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#acacac]" />
                        <Input
                            id="last_name"
                            placeholder="Dela Cruz"
                            value={data.last_name || ''}
                            onChange={handleChange('last_name')}
                            className="rounded-lg border-[#e5e5e5] pl-9 focus-visible:ring-secondary"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-medium">
                    Phone Number
                </Label>
                <div className="relative">
                    <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#acacac]" />
                    <Input
                        id="phone_number"
                        placeholder="+63 912 345 6789"
                        value={data.phone_number || ''}
                        onChange={handleChange('phone_number')}
                        className="rounded-lg border-[#e5e5e5] pl-9 focus-visible:ring-secondary"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                    Address
                </Label>
                <div className="relative">
                    <MapPin className="absolute top-3 left-3 size-4 text-[#acacac]" />
                    <textarea
                        id="address"
                        placeholder="Street, Barangay, City, Province"
                        value={data.address || ''}
                        onChange={handleChange('address')}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-[#e5e5e5] py-2 pr-4 pl-9 text-sm outline-none placeholder:text-[#acacac] focus:ring-2 focus:ring-secondary"
                    />
                </div>
            </div>

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
