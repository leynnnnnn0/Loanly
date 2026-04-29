import Navbar from '@/components/Navbar';
import VerificationStepIndicator from './components/VerificationStepIndicator';
import AboutYouStep from './components/AboutYouStep';
import IdentityStep from './components/IdentityStep';
import ReferencesStep from './components/ReferenceStep';
import ConfirmationStep from './components/ConfirmationStep';
import VerificationSuccess from './components/VerificationSuccess';

import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function Index() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);

   const { data, setData, post, processing } = useForm({
       first_name: '', 
       last_name: '', 
       phone_number: '', 
       address: '', 
       date_of_birth: '',
       nationality: '',
       id_type: '',
       id_number: '',
       issue_date: '',
       expiry_date: '',
       id_image: null,
       references: [],
   });

    const next = () => setStep((s) => Math.min(s + 1, 4));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const handleAboutYouChange = (values) => {
        setData((prev) => ({ ...prev, ...values }));
    };

    const handleIdentityChange = (values) => {
        setData((prev) => ({
            ...prev,
            ...values,
            id_image: values.image_file ?? prev.id_image,
        }));
    };

    const handleReferencesChange = (refs) => {
        setData('references', refs);
    };

    const handleSubmit = () => {
        post('/user/profile', {
            forceFormData: true, 
            onSuccess: () => setSubmitted(true),
            onError: (e) => {
                console.log(e);
            }
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

    const identity = {
        id_type: data.id_type,
        id_number: data.id_number,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        image_file: data.id_image,
        image_preview: data.id_image
            ? URL.createObjectURL(data.id_image)
            : null,
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
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
