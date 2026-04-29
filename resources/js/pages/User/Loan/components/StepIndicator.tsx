import { Check } from 'lucide-react';

const steps = [
    { id: 1, label: 'Personal Details' },
    { id: 2, label: 'ID Verification' },
    { id: 3, label: 'References' },
    { id: 4, label: 'Loan Details' },
    { id: 5, label: 'Review' },
];

export default function StepIndicator({ currentStep } : any) {
    return (
        <div className="flex items-center justify-center py-6">
            {steps.map((step, index) => {
                const isDone = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                    <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`flex size-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                                    isDone
                                        ? 'bg-accent text-white'
                                        : isActive
                                          ? 'bg-primary text-white ring-4 ring-primary/10'
                                          : 'bg-[#ebebeb] text-[#acacac]'
                                }`}
                            >
                                {isDone ? (
                                    <Check className="size-4" />
                                ) : (
                                    step.id
                                )}
                            </div>
                            <span
                                className={`text-xs font-medium whitespace-nowrap ${
                                    isActive
                                        ? 'text-primary'
                                        : isDone
                                          ? 'text-primary/60'
                                          : 'text-[#acacac]'
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={`mx-2 mb-5 h-0.5 w-16 transition-all duration-500 ${
                                    currentStep > step.id
                                        ? 'bg-primary'
                                        : 'bg-[#e0e0e0]'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
