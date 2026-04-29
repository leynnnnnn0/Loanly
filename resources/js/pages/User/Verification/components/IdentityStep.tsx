import { useRef } from 'react';
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
import { Upload, ShieldCheck, ShieldAlert } from 'lucide-react';

const ID_TYPES = [
    "Driver's License",
    'Passport',
    'SSS ID',
    'PhilHealth ID',
    'Postal ID',
    "Voter's ID",
    'National ID (PhilSys)',
    'UMID',
    'PRC ID',
];

export default function IdentityStep({ data, onChange, onNext, onBack } : any) {
    const fileRef = useRef(null);

    const set = (field) => (val) =>
        onChange({ ...data, [field]: val?.target ? val.target.value : val });

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange({
                ...data,
                image_file: file,
                image_preview: URL.createObjectURL(file),
            });
        }
    };

    // const isValid =
    //     data.id_type &&
    //     data.id_number &&
    //     data.issue_date &&
    //     data.expiry_date &&
    //     data.image_file;
    
    const isValid = true;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <p className="text-xs font-semibold tracking-widest text-[#acacac] uppercase">
                    Step 2 of 4
                </p>
                <h2 className="text-2xl font-semibold">
                    Now let's confirm your identity
                </h2>
                <p className="text-sm text-[#acacac]">
                    We need a valid government-issued ID to verify you're really
                    you.
                </p>
            </div>

            {/* Upload zone */}
            <div
                onClick={() => fileRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all hover:border-black/30 hover:bg-accent/[0.015] ${
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
                        <ShieldCheck className="size-9 text-green-500" />
                        <div>
                            <p className="text-sm font-semibold text-green-700">
                                {data.image_file?.name}
                            </p>
                            <p className="text-xs text-green-500">
                                Tap to replace
                            </p>
                        </div>
                        <img
                            src={data.image_preview}
                            alt="ID Preview"
                            className="mt-1 h-24 w-auto rounded-xl object-cover shadow-sm"
                        />
                    </>
                ) : (
                    <>
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#f5f5f5]">
                            <Upload className="size-6 text-[#a0a0a0]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Upload your ID photo
                            </p>
                            <p className="text-xs text-[#acacac]">
                                PNG or JPG — front side, clear and unobstructed
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* ID fields */}
            <div className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-black/70">
                        ID Type <span className="text-red-400">*</span>
                    </Label>
                    <Select
                        value={data.id_type || ''}
                        onValueChange={set('id_type')}
                    >
                        <SelectTrigger className="w-full rounded-xl border-[#e8e8e8] focus:ring-black">
                            <SelectValue placeholder="Select an ID type" />
                        </SelectTrigger>
                        <SelectContent>
                            {ID_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium text-black/70">
                        ID Number <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        placeholder="Enter your ID number"
                        value={data.id_number || ''}
                        onChange={set('id_number')}
                        className="rounded-xl border-[#e8e8e8] focus-visible:ring-black"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-black/70">
                            Issue Date <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            type="date"
                            value={data.issue_date || ''}
                            onChange={set('issue_date')}
                            className="rounded-xl border-[#e8e8e8] focus-visible:ring-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-black/70">
                            Expiry Date <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            type="date"
                            value={data.expiry_date || ''}
                            onChange={set('expiry_date')}
                            className="rounded-xl border-[#e8e8e8] focus-visible:ring-black"
                        />
                    </div>
                </div>
            </div>


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
