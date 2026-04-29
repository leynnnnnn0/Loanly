import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    CalendarDays,
    Globe,
    ShieldCheck,
    Users,
    CheckCircle2,
    ChevronRight,
} from 'lucide-react';

function ReviewSection({
    icon: Icon,
    title,
    color = 'bg-[#f5f5f5]',
    iconColor = 'text-black/40',
    children,
} : any) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#ebebeb]">
            <div className="flex items-center gap-3 bg-[#fafafa] px-5 py-4">
                <div
                    className={`flex size-8 items-center justify-center rounded-xl ${color}`}
                >
                    <Icon className={`size-4 ${iconColor}`} />
                </div>
                <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            <div className="space-y-2.5 px-5 py-4">{children}</div>
        </div>
    );
}

function ReviewRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-6">
            <span className="shrink-0 text-xs text-[#acacac]">{label}</span>
            <span className="text-right text-xs font-medium text-black">
                {value || '—'}
            </span>
        </div>
    );
}

export default function ConfirmationStep({
    aboutYou,
    identity,
    references,
    onBack,
    onSubmit,
    isSubmitting,
}) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <p className="text-xs font-semibold tracking-widest text-[#acacac] uppercase">
                    Step 4 of 4
                </p>
                <h2 className="text-2xl font-semibold">You're almost there!</h2>
                <p className="text-sm text-[#acacac]">
                    Review your details carefully before submitting your
                    verification.
                </p>
            </div>

            {/* Review sections */}
            <div className="space-y-4">
                {/* About You */}
                <ReviewSection
                    icon={CalendarDays}
                    title="About You"
                    color="bg-primary"
                    iconColor="text-white"
                >
                    <ReviewRow
                        label="Date of Birth"
                        value={
                            aboutYou.date_of_birth
                                ? new Date(
                                      aboutYou.date_of_birth,
                                  ).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                  })
                                : '—'
                        }
                    />
                    <Separator className="my-1" />
                    <ReviewRow
                        label="Nationality"
                        value={aboutYou.nationality}
                    />
                </ReviewSection>

                {/* Identity */}
                <ReviewSection
                    icon={ShieldCheck}
                    title="Identity"
                    color="bg-primary"
                    iconColor="text-white"
                >
                    <ReviewRow label="ID Type" value={identity.id_type} />
                    <Separator className="my-1" />
                    <ReviewRow label="ID Number" value={identity.id_number} />
                    <Separator className="my-1" />
                    <ReviewRow label="Issue Date" value={identity.issue_date} />
                    <Separator className="my-1" />
                    <ReviewRow
                        label="Expiry Date"
                        value={identity.expiry_date}
                    />
                    {identity.image_preview && (
                        <>
                            <Separator className="my-1" />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#acacac]">
                                    ID Photo
                                </span>
                                <img
                                    src={identity.image_preview}
                                    alt="ID"
                                    className="h-12 w-auto rounded-lg object-cover shadow-sm"
                                />
                            </div>
                        </>
                    )}
                </ReviewSection>

                {/* References */}
                <ReviewSection
                    icon={Users}
                    title={`References (${references.length})`}
                    color="bg-primary"
                    iconColor="text-white"
                >
                    {references.map((ref, i) => (
                        <div key={i}>
                            {i > 0 && <Separator className="my-3" />}
                            <p className="mb-2 text-[10px] font-bold tracking-widest text-[#c0c0c0] uppercase">
                                Reference {i + 1}
                            </p>
                            <div className="space-y-2">
                                <ReviewRow
                                    label="Name"
                                    value={`${ref.first_name} ${ref.last_name}`}
                                />
                                <ReviewRow
                                    label="Phone"
                                    value={ref.phone_number}
                                />
                                <ReviewRow
                                    label="Relationship"
                                    value={ref.relationship}
                                />
                                <ReviewRow
                                    label="Address"
                                    value={ref.address}
                                />
                            </div>
                        </div>
                    ))}
                </ReviewSection>
            </div>

            {/* Consent note */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#f9f9f9] p-4">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-black/30" />
                <p className="text-xs leading-relaxed text-black/50">
                    By submitting, you confirm that all information provided is
                    accurate and true. Falsified information may result in
                    disqualification from the loan program.
                </p>
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="rounded-full border-[#e0e0e0] px-8 py-5 text-sm font-bold"
                >
                    ← Back
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-full bg-accent px-8 py-5 text-sm font-bold text-white hover:bg-accent/85 disabled:opacity-40"
                >
                    {isSubmitting ? (
                        'Submitting...'
                    ) : (
                        <>
                            Submit Verification
                            <ChevronRight className="size-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
