import { Check } from 'lucide-react';

const STEPS = [
    { id: 1, label: 'About You' },
    { id: 2, label: 'Identity' },
    { id: 3, label: 'References' },
    { id: 4, label: 'Confirmation' },
];

export default function VerificationStepIndicator({ current } : any) {
    return (
        <div className="flex items-center justify-center">
            {STEPS.map((step, i) => {
                const done = current > step.id;
                const active = current === step.id;
                return (
                    <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`flex size-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                                    done
                                        ? 'bg-accent text-white'
                                        : active
                                          ? 'bg-accent text-white ring-4 ring-black/10'
                                          : 'bg-[#f0f0f0] text-[#b0b0b0]'
                                }`}
                            >
                                {done ? <Check className="size-4" /> : step.id}
                            </div>
                            <span
                                className={`text-xs font-medium whitespace-nowrap transition-colors ${
                                    active
                                        ? 'text-black'
                                        : done
                                          ? 'text-black/50'
                                          : 'text-[#c0c0c0]'
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {i < STEPS.length - 1 && (
                            <div
                                className={`mx-3 mb-5 h-px w-14 transition-all duration-500 ${
                                    current > step.id
                                        ? 'bg-accent'
                                        : 'bg-[#e8e8e8]'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
