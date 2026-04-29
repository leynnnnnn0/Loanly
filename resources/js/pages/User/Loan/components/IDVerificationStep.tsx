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
import { Upload, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';

const ID_TYPES = [
    "Driver's License",
    'Passport',
    'SSS ID',
    'PhilHealth ID',
    'Postal ID',
    'Voter\'s ID',
    'National ID (PhilSys)',
    'UMID',
    'PRC ID',
];

export default function IDVerificationStep({ data, onChange, onNext, onBack }) {
    const fileRef = useRef(null);

    const handleChange = (field) => (e) =>
        onChange({ ...data, [field]: e.target.value });

    const handleSelect = (field) => (value) =>
        onChange({ ...data, [field]: value });

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (file) onChange({ ...data, image_file: file, image_preview: URL.createObjectURL(file) });
    };

    // const isValid =
    //     data.id_type &&
    //     data.id_number &&
    //     data.issue_date &&
    //     data.expiry_date &&
    //     data.image_file;

    const isValid = true;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">ID Verification</h2>
                <p className="mt-1 text-sm text-[#acacac]">
                    We need a valid government-issued ID to verify your identity.
                </p>
            </div>

            <div
                onClick={() => fileRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all hover:border-secondary/40 hover:bg-secondary/[0.02] ${
                    data.image_preview
                        ? 'border-green-300 bg-green-50'
                        : 'border-[#e0e0e0]'
                }`}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                />
                {data.image_preview ? (
                    <>
                        <ShieldCheck className="size-8 text-green-600" />
                        <p className="text-sm font-medium text-green-700">
                            {data.image_file?.name}
                        </p>
                        <p className="text-xs text-green-600">
                            Click to replace
                        </p>
                        <img
                            src={data.image_preview}
                            alt="ID preview"
                            className="mt-2 h-24 w-auto rounded-lg object-cover shadow-sm"
                        />
                    </>
                ) : (
                    <>
                        <div className="flex size-12 items-center justify-center rounded-full bg-[#f5f5f5]">
                            <Upload className="size-5 text-[#7e7e7e]" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">
                                Upload ID Photo
                            </p>
                            <p className="text-xs text-[#acacac]">
                                PNG, JPG up to 10MB
                            </p>
                        </div>
                    </>
                )}
            </div>


            <div className="space-y-2">
                <Label className="text-sm font-medium">ID Type</Label>
                <Select
                    value={data.id_type || ''}
                    onValueChange={handleSelect('id_type')}
                >
                    <SelectTrigger className="w-full rounded-lg border-[#e5e5e5] focus:ring-secondary">
                        <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                        {ID_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium">ID Number</Label>
                <Input
                    placeholder="Enter your ID number"
                    value={data.id_number || ''}
                    onChange={handleChange('id_number')}
                    className="rounded-lg border-[#e5e5e5] focus-visible:ring-secondary"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Issue Date</Label>
                    <Input
                        type="date"
                        value={data.issue_date || ''}
                        onChange={handleChange('issue_date')}
                        className="rounded-lg border-[#e5e5e5] focus-visible:ring-secondary"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Expiry Date</Label>
                    <Input
                        type="date"
                        value={data.expiry_date || ''}
                        onChange={handleChange('expiry_date')}
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