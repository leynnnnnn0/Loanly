import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export default function VerificationSuccess() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
            {/* Animated check */}
            <div className="relative flex size-24 items-center justify-center rounded-full bg-green-100">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-60" />
                <CheckCircle2 className="relative size-12 text-green-500" />
            </div>

            <div className="space-y-2 max-w-sm">
                <h2 className="text-2xl font-bold">Verification Submitted!</h2>
                <p className="text-sm text-[#acacac] leading-relaxed">
                    Your verification details have been received. Our team will
                    review everything and get back to you within 24–48 hours.
                </p>
            </div>

            {/* What happens next */}
            <div className="w-full max-w-sm rounded-2xl bg-green-100 p-5 text-left space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#acacac]">
                    What happens next
                </p>
                {[
                    'We review your submitted documents',
                    'We contact your references if needed',
                    'You receive an approval notification',
                ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-green-100 mt-0.5">
                            {i + 1}
                        </div>
                        <p className="text-sm text-black/60">{step}</p>
                    </div>
                ))}
            </div>

            <Link href="/user/dashboard">
                <Button className="rounded-full bg-accent px-8 py-5 text-sm font-bold text-white hover:bg-accent/85">
                    Go to Dashboard
                </Button>
            </Link>
        </div>
    );
}