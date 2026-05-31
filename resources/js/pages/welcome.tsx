import { Head,router } from '@inertiajs/react';
import {
BadgeCheck,
Bell,
CheckCircle2,
Clock,
CreditCard,
FileText,
ShieldCheck,
Upload,
Wallet,
} from 'lucide-react';
import {
Accordion,
AccordionContent,
AccordionItem,
AccordionTrigger,
} from '@/components/ui/accordion';
import AnalyticsPreview from '../../images/loanly-analytics.png';
import ComparisonTexture from '../../images/loanly-comparison.png';
import DashboardPreview from '../../images/loanly-dashboard.png';
import HeroPreview from '../../images/loanly-hero.png';
import RepaymentPreview from '../../images/loanly-repayments.jpg';
import Footer from './Footer';
import Navigation from './Navigation';

const faqs = [
    {
        question: 'What is Loanly?',
        answer: 'Loanly is an online lending app where customers can verify their profile, request a loan, upload supporting files, and track repayment status in one account.',
    },
    {
        question: 'How do I apply for a loan?',
        answer: 'Create an account, complete your borrower profile, submit the amount and purpose, then wait for admin review. You will receive notifications as your application moves forward.',
    },
    {
        question: 'What documents can I upload?',
        answer: 'You can upload supporting images or PDF files during verification, loan application, and payment submission where required.',
    },
    {
        question: 'How fast is approval?',
        answer: 'Applications are reviewed after profile verification and document checking. Loanly keeps the status visible so you always know what is pending.',
    },
    {
        question: 'Can I track payments?',
        answer: 'Yes. Borrowers can view schedules, submit payment details, upload receipts, and see which payments are pending or approved.',
    },
];

const stats = [
    ['Fast', 'profile verification and application review'],
    ['24/7', 'loan status and repayment access'],
    ['100%', 'transparent schedules before approval'],
    ['Secure', 'document uploads and account notifications'],
];

const steps = [
    {
        icon: BadgeCheck,
        title: 'Verify your profile',
        description: 'Submit your borrower information once and keep your account ready for future loan requests.',
    },
    {
        icon: Upload,
        title: 'Upload supporting files',
        description: 'Attach IDs, proof, or loan request documents directly from the application page.',
    },
    {
        icon: Wallet,
        title: 'Request a loan',
        description: 'Choose your amount, purpose, duration, and repayment frequency with a clear schedule preview.',
    },
    {
        icon: Bell,
        title: 'Stay updated',
        description: 'Receive notifications when admins review, approve, reject, or update your loan.',
    },
];

const features = [
    {
        image: DashboardPreview,
        title: 'Apply with a clear repayment preview',
        description: 'See the loan amount, interest, due dates, and total repayment before submitting your request.',
        items: ['Payment schedule preview', 'Transparent terms', 'Borrowing limit visibility'],
    },
    {
        image: RepaymentPreview,
        title: 'Track every repayment from your dashboard',
        description: 'View active loans, due dates, payment history, and pending approvals without calling support.',
        items: ['Receipt uploads', 'Payment approval status', 'Remaining balance tracking'],
        reverse: true,
    },
    {
        image: AnalyticsPreview,
        title: 'Know where your application stands',
        description: 'Loanly keeps application, profile, and payment statuses organized from request to completion.',
        items: ['Real-time notifications', 'Profile review status', 'Loan activity history'],
    },
];

function CheckList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-3 pt-2">
            {items.map((item) => (
                <li
                    key={item}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600"
                >
                    <CheckCircle2 className="size-4 text-accent" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

export default function Welcome() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Head title="Loanly" />
            <Navigation />

            <main>
                <section
                    id="home"
                    className="min-h-[calc(100vh-4.5rem)] bg-gray-50"
                >
                    <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
                        <div className="space-y-7 text-center lg:text-left">
                            <span className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-bold tracking-widest text-gray-800 uppercase">
                                Fast and secure online lending
                            </span>
                            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                                Get the funds you need with Loanly.
                            </h1>
                            <p className="mx-auto max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg lg:mx-0">
                                Apply online, upload documents, follow your
                                approval status, and manage repayments from one
                                secure borrower dashboard.
                            </p>
                            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                                <button
                                    type="button"
                                    onClick={() => router.get('/register')}
                                    className="rounded-md bg-primary px-7 py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-accent"
                                >
                                    Apply now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.get('/login')}
                                    className="rounded-md border border-secondary bg-white px-7 py-3 text-sm font-bold text-gray-800 shadow-sm transition hover:bg-secondary/40"
                                >
                                    Login
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3 pt-3 text-xs font-bold tracking-wide text-gray-500 uppercase">
                                <span>No hidden steps</span>
                                <span>Secure uploads</span>
                                <span>Status alerts</span>
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-[520px]">
                            <div className="absolute -top-5 -right-5 h-28 w-28 rounded-full bg-primary" />
                            <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-secondary" />
                            <div className="relative overflow-hidden rounded-md border border-gray-200 bg-white p-4 shadow-xl">
                                <img
                                    src={HeroPreview}
                                    alt="Loanly online lending dashboard preview"
                                    className="aspect-[4/3] w-full rounded-md object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="features"
                    className="bg-secondary/35 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
                >
                    <div className="mx-auto max-w-6xl space-y-14">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="relative min-h-64 overflow-hidden rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                                <span className="absolute top-4 left-4 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold tracking-wide text-gray-600 uppercase">
                                    Without Loanly
                                </span>
                                <img
                                    src={ComparisonTexture}
                                    alt=""
                                    className="absolute inset-0 size-full object-cover opacity-10"
                                />
                                <div className="relative mt-12 space-y-4">
                                    <div className="max-w-sm rounded-md border border-red-100 bg-white p-4 shadow-sm">
                                        <p className="text-sm font-bold text-red-600">
                                            Missed requirements
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Borrowers wait without knowing what
                                            document or approval step is still
                                            pending.
                                        </p>
                                    </div>
                                    <div className="ml-auto max-w-sm rounded-md border border-gray-100 bg-white p-4 shadow-sm">
                                        <p className="text-sm font-bold text-gray-700">
                                            Unclear repayment details
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Due dates, balances, and payment
                                            approvals are hard to track
                                            manually.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative min-h-64 rounded-md border border-primary bg-primary/45 p-6 shadow-sm">
                                <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 text-xs font-bold tracking-wide text-gray-900 uppercase">
                                    With Loanly
                                </span>
                                <div className="mt-12 space-y-4">
                                    {[
                                        {
                                            icon: FileText,
                                            title: 'Complete application trail',
                                            text: 'Profile, loan request, files, and review status stay connected.',
                                        },
                                        {
                                            icon: CreditCard,
                                            title: 'Repayment visibility',
                                            text: 'Borrowers can see schedules, balances, and payment approvals.',
                                        },
                                    ].map(({ icon: Icon, title, text }) => (
                                        <div
                                            key={title}
                                            className="flex items-start gap-3 rounded-md border border-primary bg-white p-4 shadow-sm"
                                        >
                                            <Icon className="mt-0.5 size-5 text-accent" />
                                            <div>
                                                <p className="text-sm font-bold">
                                                    {title}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                                A cleaner way to borrow online
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-gray-600">
                                Loanly keeps the loan process organized for
                                borrowers and admins, from verification to
                                repayment.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {stats.map(([label, description]) => (
                                <div
                                    key={label}
                                    className="rounded-md border border-gray-200 bg-white p-6 shadow-sm transition hover:border-primary hover:shadow-md"
                                >
                                    <p className="text-3xl font-extrabold text-gray-900">
                                        {label}
                                    </p>
                                    <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="about"
                    className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
                >
                    <div className="grid gap-4 md:grid-cols-4">
                        {steps.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="rounded-md border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary hover:shadow-md"
                            >
                                <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-secondary">
                                    <Icon className="size-5 text-gray-800" />
                                </div>
                                <h3 className="font-bold">{title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="grid items-center gap-8 md:grid-cols-2"
                        >
                            <div
                                className={
                                    feature.reverse
                                        ? 'order-2 md:order-1'
                                        : ''
                                }
                            >
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full rounded-md border border-gray-200 bg-white object-cover shadow-sm"
                                />
                            </div>
                            <div
                                className={`space-y-4 text-center md:text-left ${
                                    feature.reverse
                                        ? 'order-1 md:order-2'
                                        : ''
                                }`}
                            >
                                <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">
                                    {feature.title}
                                </h2>
                                <p className="text-base leading-relaxed text-gray-600">
                                    {feature.description}
                                </p>
                                <CheckList items={feature.items} />
                            </div>
                        </div>
                    ))}
                </section>

                <section
                    id="pricing"
                    className="bg-primary/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
                >
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto mb-10 max-w-3xl text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                                Simple and transparent from the start
                            </h2>
                            <p className="mt-4 text-gray-600">
                                Loanly shows the schedule, uploaded documents,
                                and application status before you move forward.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: 'Secure account',
                                    text: 'Borrower data and files stay tied to your authenticated account.',
                                },
                                {
                                    icon: Clock,
                                    title: 'Clear timelines',
                                    text: 'See pending, active, approved, rejected, and completed loan states.',
                                },
                                {
                                    icon: CreditCard,
                                    title: 'Payment records',
                                    text: 'Submit payment details and keep receipts attached to your loan history.',
                                },
                            ].map(({ icon: Icon, title, text }) => (
                                <div
                                    key={title}
                                    className="rounded-md border border-gray-200 bg-white p-6 shadow-sm"
                                >
                                    <Icon className="mb-4 size-7 text-gray-900" />
                                    <h3 className="text-lg font-bold">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="contact"
                    className="border-t border-gray-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
                >
                    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                                Frequently Asked Questions
                            </h2>
                        </div>
                        <div className="lg:col-span-8">
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                {faqs.map((faq, index) => (
                                    <AccordionItem
                                        key={faq.question}
                                        value={`faq-${index}`}
                                    >
                                        <AccordionTrigger className="text-left font-bold">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="leading-relaxed text-gray-500">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
