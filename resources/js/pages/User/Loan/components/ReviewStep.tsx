import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    User,
    ShieldCheck,
    Users,
    PhilippinePeso,
} from 'lucide-react';

function ReviewSection({ icon: Icon, title, children }) {
    return (
        <div className="space-y-3 rounded-xl border border-[#ebebeb] p-5">
            <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#f5f5f5]">
                    <Icon className="size-4 text-black/60" />
                </div>
                <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            <Separator />
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-xs text-[#acacac]">{label}</span>
            <span className="max-w-[60%] text-right text-xs font-medium text-black">
                {value || '—'}
            </span>
        </div>
    );
}

export default function ReviewStep({
    personal,
    identification,
    references,
    loan,
    onBack,
}) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Review Application</h2>
                <p className="mt-1 text-sm text-[#acacac]">
                    Please review all details carefully before submitting.
                </p>
            </div>

            {/* Personal */}
            <ReviewSection icon={User} title="Personal Details">
                <Row
                    label="Full Name"
                    value={`${personal.first_name} ${personal.last_name}`}
                />
                <Row label="Phone Number" value={personal.phone_number} />
                <Row label="Address" value={personal.address} />
            </ReviewSection>

            {/* ID */}
            <ReviewSection icon={ShieldCheck} title="ID Verification">
                <Row label="ID Type" value={identification.id_type} />
                <Row label="ID Number" value={identification.id_number} />
                <Row label="Issue Date" value={identification.issue_date} />
                <Row label="Expiry Date" value={identification.expiry_date} />
                {identification.image_preview && (
                    <img
                        src={identification.image_preview}
                        alt="ID"
                        className="mt-2 h-16 w-auto rounded-lg object-cover"
                    />
                )}
            </ReviewSection>

            {/* References */}
            <ReviewSection
                icon={Users}
                title={`References (${references.length})`}
            >
                {references.map((ref, i) => (
                    <div
                        key={i}
                        className={
                            i > 0 ? 'mt-2 border-t border-[#f0f0f0] pt-2' : ''
                        }
                    >
                        <p className="mb-1.5 text-xs font-semibold text-black/50">
                            Reference {i + 1}
                        </p>
                        <Row
                            label="Name"
                            value={`${ref.first_name} ${ref.last_name}`}
                        />
                        <Row label="Phone" value={ref.phone_number} />
                        <Row label="Relationship" value={ref.relationship} />
                        <Row label="Address" value={ref.address} />
                    </div>
                ))}
            </ReviewSection>

            {/* Loan */}
            <ReviewSection icon={PhilippinePeso} title="Loan Details">
                <Row
                    label="Amount"
                    value={
                        loan.amount
                            ? `$${Number(loan.amount).toLocaleString()}.00`
                            : '—'
                    }
                />
                <Row label="Interest Type" value={loan.interest_type} />
                <Row
                    label="Interest Value"
                    value={
                        loan.interest_value
                            ? `${loan.interest_value}${loan.interest_type === 'percentage' ? '%' : ' flat'}`
                            : '—'
                    }
                />
                <Row
                    label="Interest Period"
                    value={loan.interest_period?.replace('_', ' ')}
                />
                <Row
                    label="Duration"
                    value={`${loan.loan_duration} ${loan.duration_unit}`}
                />
                <Row label="Payment Frequency" value={loan.payment_frequency} />
                <Row label="Transaction Date" value={loan.transaction_date} />
            </ReviewSection>

            <div className="flex justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="rounded-full border-[#e0e0e0] px-8 py-5 text-sm font-bold"
                >
                    ← Back
                </Button>
            </div>
        </div>
    );
}
