import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function SuccessScreen({ contractNumber }) {
    return (
        <div className="flex flex-col items-center justify-center space-y-5 py-24 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="size-10 text-green-600" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Application Submitted!</h2>
                <p className="mx-auto max-w-sm text-sm text-[#acacac]">
                    Your loan application has been received. We'll review it and
                    get back to you within 24 hours.
                </p>
                {contractNumber && (
                    <p className="text-sm font-semibold">
                        Contract No:{' '}
                        <span className="font-bold text-black">
                            {contractNumber}
                        </span>
                    </p>
                )}
            </div>
            <Link href="/loans">
                <Button className="rounded-full bg-black px-8 py-5 text-sm font-bold text-white hover:bg-black/85">
                    View My Loans
                </Button>
            </Link>
        </div>
    );
}
