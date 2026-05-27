import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import AboutYouStep from './components/AboutYouStep';
import ConfirmationStep from './components/ConfirmationStep';
import IdentityStep from './components/IdentityStep';
import ReferencesStep from './components/ReferenceStep';
import VerificationStepIndicator from './components/VerificationStepIndicator';
import VerificationSuccess from './components/VerificationSuccess';


export default function Index({ borrower }: any) {
    console.log(borrower);
    const [step, setStep] = useState(1);
    const [submitted] = useState(false);

    // Derive prefill values from borrower if present
    const id = borrower?.identification ?? {};
    const refs = borrower?.references ?? [];

    const { data, setData, post, processing } = useForm({
        is_existing: borrower != null,
        first_name: borrower?.first_name ?? '',
        last_name: borrower?.last_name ?? '',
        phone_number: borrower?.phone_number ?? '',
        address: borrower?.address ?? '',
        date_of_birth: borrower?.date_of_birth ?? '',
        nationality: borrower?.nationality ?? '',
        id_type: id.id_type ?? '',
        id_number: id.id_number ?? '',
        issue_date: id.issue_date ?? '',
        expiry_date: id.expiry_date ?? '',
        id_image: null, // File objects can't be prefilled
        references: refs.map((r: any) => ({
            first_name: r.first_name ?? '',
            last_name: r.last_name ?? '',
            relationship: r.relationship ?? '',
            phone_number: r.phone_number ?? '',
            address: r.address ?? '',
        })),
    });

    const next = () => setStep((s) => Math.min(s + 1, 4));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const handleAboutYouChange = (values: any) => {
        setData((prev) => ({ ...prev, ...values }));
    };

    const handleIdentityChange = (values: any) => {
        setData((prev) => ({
            ...prev,
            ...values,
            id_image: values.image_file ?? prev.id_image,
        }));
    };

    const handleReferencesChange = (refs: any) => {
        setData('references', refs);
    };

    const handleSubmit = () => {
        post('/user/profile', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Submitted Successfully!');
            },
            onError: (e) => {
                toast.error('Something went wrong!');
                console.log(e);
            },
        });
    };

    const aboutYou = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        address: data.address,
        date_of_birth: data.date_of_birth,
        nationality: data.nationality,
    };

    // Prefill image_preview from existing ID image URL if no new file chosen
    const existingIdImageUrl = borrower?.identification?.id_image_url ?? null;

    const identity = {
        id_type: data.id_type,
        id_number: data.id_number,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        image_file: data.id_image,
        image_preview: data.id_image
            ? URL.createObjectURL(data.id_image)
            : existingIdImageUrl,
    };

    return (
        <div className="min-h-screen bg-[#FCFCFC] px-50 pb-20">
            <Navbar />

            {!submitted && (
                <>
                    <div className="py-8 text-center">
                        <h1 className="text-3xl font-medium">
                            Borrower Verification
                        </h1>
                        <p className="mt-1 text-sm text-[#acacac]">
                            Complete all steps to unlock your loan eligibility.
                        </p>
                    </div>
                    <VerificationStepIndicator current={step} />
                </>
            )}

            {submitted ? (
                <VerificationSuccess />
            ) : (
                <div className="mt-10 grid grid-cols-1 gap-8">
                    <div className="col-span-2 rounded-2xl bg-white p-8 shadow-sm">
                        {step === 1 && (
                            <AboutYouStep
                                data={aboutYou}
                                onChange={handleAboutYouChange}
                                onNext={next}
                            />
                        )}
                        {step === 2 && (
                            <IdentityStep
                                data={identity}
                                onChange={handleIdentityChange}
                                onNext={next}
                                onBack={back}
                            />
                        )}
                        {step === 3 && (
                            <ReferencesStep
                                data={data.references}
                                onChange={handleReferencesChange}
                                onNext={next}
                                onBack={back}
                            />
                        )}
                        {step === 4 && (
                            <ConfirmationStep
                                aboutYou={aboutYou}
                                identity={identity}
                                references={data.references}
                                onBack={back}
                                onSubmit={handleSubmit}
                                isSubmitting={processing}
                                onGoToStep={setStep}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
