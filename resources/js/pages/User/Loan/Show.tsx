import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    CheckCircle2,
    Clock,
    CreditCard,
    PhilippinePeso,
    FileText,
    History,
    AlertTriangle,
    TrendingUp,
    XCircle,
    Info,
    Hourglass,
    Paperclip,
    X,
    ImageIcon,
    ZoomIn,
} from 'lucide-react';
import { useState, useRef } from 'react';
function storageUrl(path: string): string {
    return `/storage/${path}`;
}

function isPdf(path: string): boolean {
    return path.toLowerCase().endsWith('.pdf');
}
// ─── Types ────────────────────────────────────────────────────────────────────
interface PaymentHistory {
    id: number;
    payment_schedule_id: number;
    amount_paid: string;
    payment_method: string;
    reference_number: string | null;
    receipt_number: string | null;
    payment_date: string;
    status: string; // for_approval | approved | rejected
}

interface PaymentSchedule {
    id: number;
    due_date: string;
    amount_due: string;
    penalty_amount: string | null;
    rebate_amount: string | null;
    status: string; // pending | paid | overdue
    payment_histories: PaymentHistory[];
}

interface Loan {
    id: number;
    contract_number: string;
    transaction_date: string;
    status: 'pending' | 'active' | 'completed' | 'voided';
    is_voided: boolean;
    voided_at: string | null;
    void_reason: string | null;
    amount: number;
    interest_type: string;
    interest_value: number;
    interest_period: string;
    loan_duration: number;
    duration_unit: string;
    payment_frequency: string;
    total_paid: number;
    remaining: number;
    payment_schedules: PaymentSchedule[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const php = (v: number | string) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(Number(v) || 0);

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

const today = new Date().toISOString().split('T')[0];

/** Compute effective total due for a schedule (amount_due + penalty - rebate) */
function scheduleTotalDue(s: PaymentSchedule): number {
    return (
        parseFloat(s.amount_due || '0') +
        parseFloat(s.penalty_amount || '0') -
        parseFloat(s.rebate_amount || '0')
    );
}

/** Sum of APPROVED payments only for a schedule */
function approvedPaid(s: PaymentSchedule): number {
    return (s.payment_histories ?? [])
        .filter((h) => h.status === 'approved')
        .reduce((sum, h) => sum + parseFloat(h.amount_paid || '0'), 0);
}

/** Sum of FOR_APPROVAL payments (pending review) */
function pendingPaid(s: PaymentSchedule): number {
    return (s.payment_histories ?? [])
        .filter((h) => h.status === 'for_approval')
        .reduce((sum, h) => sum + parseFloat(h.amount_paid || '0'), 0);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: 'border-amber-300  bg-amber-50   text-amber-700',
        paid: 'border-green-300  bg-green-50   text-green-700',
        overdue: 'border-red-300    bg-red-50     text-red-700',
        active: 'border-black/20   bg-black/5    text-black/70',
        completed: 'border-green-300  bg-green-50   text-green-700',
        voided: 'border-red-300    bg-red-50     text-red-600',
        for_approval: 'border-blue-300   bg-blue-50    text-blue-700',
        approved: 'border-green-300  bg-green-50   text-green-700',
        rejected: 'border-red-300    bg-red-50     text-red-700',
    };
    const labels: Record<string, string> = {
        pending: 'Pending',
        paid: 'Paid',
        overdue: 'Overdue',
        active: 'Active',
        completed: 'Completed',
        voided: 'Voided',
        for_approval: 'For Approval',
        approved: 'Approved',
        rejected: 'Rejected',
    };
    const key = status.toLowerCase();
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[key] ?? map.pending}`}
        >
            <Clock className="size-3" />
            {labels[key] ?? status}
        </span>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-right text-sm font-medium">
                {value ?? '—'}
            </span>
        </div>
    );
}

function SectionCard({
    icon: Icon,
    title,
    children,
    className = '',
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

// ─── Attachment Preview ────────────────────────────────────────────────────────
function AttachmentPreview({
    files,
    onRemove,
}: {
    files: File[];
    onRemove: (index: number) => void;
}) {
    if (files.length === 0) return null;

    return (
        <div className="grid grid-cols-3 gap-2">
            {files.map((file, i) => {
                const url = URL.createObjectURL(file);
                const isImage = file.type.startsWith('image/');
                return (
                    <div
                        key={i}
                        className="group relative overflow-hidden rounded-lg border border-border bg-muted/40"
                    >
                        {isImage ? (
                            <img
                                src={url}
                                alt={file.name}
                                className="h-20 w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-20 flex-col items-center justify-center gap-1 p-2 text-center">
                                <FileText className="size-6 text-muted-foreground" />
                                <span className="line-clamp-2 text-[10px] text-muted-foreground">
                                    {file.name}
                                </span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => onRemove(i)}
                            className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <X className="size-3" />
                        </button>
                        <div className="absolute right-0 bottom-0 left-0 truncate bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
                            {(file.size / 1024).toFixed(0)} KB
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({
    open,
    onClose,
    schedule,
    scheduleIndex,
}: {
    open: boolean;
    onClose: () => void;
    schedule: PaymentSchedule | null;
    scheduleIndex: number;
}) {
    const totalDue = schedule ? scheduleTotalDue(schedule) : 0;
    const alreadyApproved = schedule ? approvedPaid(schedule) : 0;
    const stillOwed = Math.max(0, totalDue - alreadyApproved);

    // Track attachment files separately (useForm doesn't handle File[] well)
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount_paid: '',
        payment_method: 'cash',
        payment_date: today,
        reference_number: '',
        receipt_number: '',
    });

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = Array.from(e.target.files ?? []);
        // Max 10 files, each ≤ 5 MB
        const valid = selected.filter((f) => f.size <= 5 * 1024 * 1024);
        setAttachments((prev) => {
            const merged = [...prev, ...valid];
            return merged.slice(0, 10); // cap at 10
        });
        // Reset input so the same file can be re-added after removal
        e.target.value = '';
    }

    function removeAttachment(index: number) {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    }

   
function handleSubmit() {
    if (!schedule) return;

    const formData = new FormData();
    formData.append('amount_paid', data.amount_paid);
    formData.append('payment_method', data.payment_method);
    formData.append('payment_date', data.payment_date);
    formData.append('reference_number', data.reference_number);
    formData.append('receipt_number', data.receipt_number ?? '');
    attachments.forEach((file) => {
        formData.append('attachments[]', file);
    });

    router.post(`/user/loans/schedules/${schedule.id}/pay`, formData, {
        onSuccess: () => {
            reset();
            setAttachments([]);
            onClose();
        },
        onError: (errs) => {
            console.error(errs);
        },
    });
}

    function handleClose() {
        reset();
        setAttachments([]);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="size-4" /> Submit Payment
                    </DialogTitle>
                    <DialogDescription>
                        Payment #{scheduleIndex + 1}
                        {schedule && (
                            <span className="ml-1">
                                (Due: {fmtDate(schedule.due_date)})
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Due summary */}
                {schedule && (
                    <div className="space-y-1.5 rounded-lg border bg-muted/40 p-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Amount Due
                            </span>
                            <span className="font-medium">
                                {php(parseFloat(schedule.amount_due))}
                            </span>
                        </div>
                        {parseFloat(schedule.penalty_amount || '0') > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Penalty
                                </span>
                                <span className="font-medium text-red-600">
                                    {php(parseFloat(schedule.penalty_amount!))}
                                </span>
                            </div>
                        )}
                        {parseFloat(schedule.rebate_amount || '0') > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Rebate
                                </span>
                                <span className="font-medium text-green-600">
                                    -{php(parseFloat(schedule.rebate_amount!))}
                                </span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                            <span>Total Still Owed</span>
                            <span>{php(stillOwed)}</span>
                        </div>
                    </div>
                )}

                <Alert className="border-blue-200 bg-blue-50">
                    <Info className="size-4 text-blue-600" />
                    <AlertDescription className="text-xs text-blue-700">
                        Your payment will be submitted for admin approval.
                        Balances update once approved. Any overpayment will
                        automatically apply to your next due schedule.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Amount *</Label>
                        <div className="relative">
                            <span className="absolute top-2.5 left-3 text-sm text-muted-foreground">
                                ₱
                            </span>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-7"
                                value={data.amount_paid}
                                onChange={(e) =>
                                    setData('amount_paid', e.target.value)
                                }
                            />
                        </div>
                        {errors.amount_paid && (
                            <p className="text-xs text-destructive">
                                {errors.amount_paid}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Payment Method *</Label>
                        <Select
                            value={data.payment_method}
                            onValueChange={(v) => setData('payment_method', v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank_transfer">
                                    Bank Transfer
                                </SelectItem>
                                <SelectItem value="gcash">GCash</SelectItem>
                                <SelectItem value="paymaya">PayMaya</SelectItem>
                                <SelectItem value="check">Check</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Payment Date *</Label>
                        <Input
                            type="date"
                            value={data.payment_date}
                            onChange={(e) =>
                                setData('payment_date', e.target.value)
                            }
                        />
                        {errors.payment_date && (
                            <p className="text-xs text-destructive">
                                {errors.payment_date}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Reference No.</Label>
                        <Input
                            placeholder="Optional"
                            value={data.reference_number}
                            onChange={(e) =>
                                setData('reference_number', e.target.value)
                            }
                        />
                    </div>

                    {/* ── Attachments ── */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>
                                Attachments{' '}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <span className="text-xs text-muted-foreground">
                                {attachments.length}/10 · max 5 MB each
                            </span>
                        </div>

                        {/* Drop zone / trigger */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={attachments.length >= 10}
                            className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-5 text-center transition-colors hover:border-foreground/30 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                                <Paperclip className="size-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    Click to upload receipts or proof
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    PNG, JPG, PDF · up to 10 files
                                </p>
                            </div>
                        </button>

                        {/* Hidden multi-file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {/* Preview grid */}
                        <AttachmentPreview
                            files={attachments}
                            onRemove={removeAttachment}
                        />

                        {(errors as any).attachments && (
                            <p className="text-xs text-destructive">
                                {(errors as any).attachments}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={processing || !data.amount_paid}
                        onClick={handleSubmit}
                        className="rounded-full"
                    >
                        {processing ? 'Submitting…' : 'Submit Payment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Void Modal ────────────────────────────────────────────────────────────────
function VoidModal({
    open,
    onClose,
    loanId,
}: {
    open: boolean;
    onClose: () => void;
    loanId: number;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        void_reason: '',
    });

    function handleSubmit() {
        post(`/user/loans/${loanId}/void`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ban className="size-4 text-red-500" /> Cancel
                        Application
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertDescription>
                        All pending payment schedules will be cancelled.
                    </AlertDescription>
                </Alert>

                <div className="space-y-1.5">
                    <Label>Reason *</Label>
                    <Textarea
                        placeholder="Why are you cancelling this application?"
                        className="min-h-[90px] resize-none"
                        value={data.void_reason}
                        onChange={(e) => setData('void_reason', e.target.value)}
                    />
                    {errors.void_reason && (
                        <p className="text-xs text-destructive">
                            {errors.void_reason}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        Back
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={processing || !data.void_reason.trim()}
                        onClick={handleSubmit}
                        className="rounded-full"
                    >
                        {processing ? 'Cancelling…' : 'Cancel Application'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Pending State ─────────────────────────────────────────────────────────────
function PendingState({ loan }: { loan: Loan }) {
    const [isVoidOpen, setIsVoidOpen] = useState(false);
    const schedules = loan.payment_schedules ?? [];

    return (
        <div className="min-h-screen bg-[#FCFCFC] px-50 pb-20">
            <Navbar />
            <div className="flex items-center justify-between py-6">
                <div>
                    <h1 className="text-3xl font-medium">Loan Details</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Contract #{loan.contract_number}
                    </p>
                </div>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/user/my-loans">
                        <ArrowLeft className="size-3.5" /> Back
                    </Link>
                </Button>
            </div>

            <Alert className="mb-6 border-amber-200 bg-amber-50">
                <Hourglass className="size-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                    Your loan application is under review. This usually takes 5
                    minutes to 24 hours. You will be notified once approved.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <SectionCard icon={FileText} title="Application Details">
                        <div className="space-y-0.5">
                            <InfoRow
                                label="Contract No."
                                value={loan.contract_number}
                            />
                            <Separator />
                            <InfoRow
                                label="Date Applied"
                                value={fmtDate(loan.transaction_date)}
                            />
                            <Separator />
                            <InfoRow
                                label="Status"
                                value={<StatusBadge status={loan.status} />}
                            />
                            <Separator />
                            <InfoRow
                                label="Loan Amount"
                                value={php(loan.amount)}
                            />
                            <Separator />
                            <InfoRow
                                label="Interest Rate"
                                value={`${loan.interest_value}% per month`}
                            />
                            <Separator />
                            <InfoRow
                                label="Duration"
                                value={`${loan.loan_duration} ${loan.duration_unit}`}
                            />
                            <Separator />
                            <InfoRow
                                label="Payment Frequency"
                                value={
                                    <span className="capitalize">
                                        {loan.payment_frequency}
                                    </span>
                                }
                            />
                        </div>
                    </SectionCard>

                    <SectionCard icon={TrendingUp} title="Schedule Preview">
                        <p className="mb-4 text-xs text-muted-foreground">
                            Preview only — confirmed upon approval.
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">
                                        Amount Due
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map((s, i) => (
                                    <TableRow key={s.id} className="opacity-60">
                                        <TableCell className="text-muted-foreground">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>
                                            {fmtDate(s.due_date)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {php(parseFloat(s.amount_due))}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <StatusBadge status={s.status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </SectionCard>
                </div>

                <div className="space-y-5">
                    <Card className="bg-primary text-primary-foreground">
                        <CardContent className="space-y-1 pt-5">
                            <div className="mb-3 flex items-center gap-2">
                                <PhilippinePeso className="size-4" />
                                <span className="text-sm font-semibold">
                                    Requested Amount
                                </span>
                            </div>
                            <p className="text-3xl font-bold">
                                {php(loan.amount)}
                            </p>
                            <p className="text-xs text-primary-foreground/60">
                                Pending approval
                            </p>
                        </CardContent>
                    </Card>

                    <Alert className="border-amber-200 bg-amber-50">
                        <Info className="size-4 text-amber-600" />
                        <AlertDescription className="text-xs text-amber-700">
                            While pending, you cannot make payments. Contact
                            support if you need assistance.
                        </AlertDescription>
                    </Alert>

                    <Button
                        variant="destructive"
                        className="w-full rounded-full"
                        onClick={() => setIsVoidOpen(true)}
                    >
                        <Ban className="size-4" /> Cancel Application
                    </Button>
                </div>
            </div>

            <VoidModal
                open={isVoidOpen}
                onClose={() => setIsVoidOpen(false)}
                loanId={loan.id}
            />
        </div>
    );
}

// ─── Main Show Page ────────────────────────────────────────────────────────────
export default function Show({ loan }: { loan: Loan }) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isVoidOpen, setIsVoidOpen] = useState(false);
    const [selected, setSelected] = useState<PaymentSchedule | null>(null);

    if (loan.status === 'pending') return <PendingState loan={loan} />;

    const schedules = loan.payment_schedules ?? [];

    const totalPayable = schedules.reduce(
        (sum, s) => sum + scheduleTotalDue(s),
        0,
    );

    const totalApprovedPaid = schedules.reduce(
        (sum, s) => sum + approvedPaid(s),
        0,
    );

    const totalPending = schedules.reduce((sum, s) => sum + pendingPaid(s), 0);

    const remaining = Math.max(0, totalPayable - totalApprovedPaid);
    const progress =
        totalPayable > 0
            ? Math.min((totalApprovedPaid / totalPayable) * 100, 100)
            : 0;

    const unpaidSchedules = schedules.filter(
        (s) => s.status.toLowerCase() !== 'paid',
    );

    const allHistories = schedules
        .flatMap((s, idx) =>
            (s.payment_histories ?? []).map((h) => ({
                ...h,
                schedule_number: idx + 1,
                due_date: s.due_date,
            })),
        )
        .sort(
            (a, b) =>
                new Date(b.payment_date).getTime() -
                new Date(a.payment_date).getTime(),
        );

    function getIndex(s: PaymentSchedule) {
        return schedules.findIndex((x) => x.id === s.id);
    }

    function openPayment(s: PaymentSchedule) {
        if (s.status === 'paid') return;
        setSelected(s);
        setIsPaymentOpen(true);
    }

    return (
        <div className="min-h-screen bg-[#FCFCFC] px-50 pb-20">
            <Navbar />

            {/* Header */}
            <div className="flex items-center justify-between py-6">
                <div>
                    <h1 className="text-3xl font-medium">Loan Details</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Contract #{loan.contract_number}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {loan.status === 'pending' && !loan.is_voided && (
                        <Button
                            variant="destructive"
                            className="rounded-full"
                            onClick={() => setIsVoidOpen(true)}
                        >
                            <Ban className="size-4" /> Cancel Loan
                        </Button>
                    )}
                    <Button variant="outline" className="rounded-full" asChild>
                        <Link href="/user/my-loans">
                            <ArrowLeft className="size-3.5" /> Back
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Voided banner */}
            {loan.is_voided ? (
                <Alert variant="destructive" className="mb-6">
                    <XCircle className="size-4" />
                    <AlertDescription>
                        This loan was voided
                        {loan.voided_at ? ` on ${fmtDate(loan.voided_at)}` : ''}
                        .
                        {loan.void_reason && (
                            <span className="ml-1">
                                Reason: {loan.void_reason}
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
            ) : (
                <></>
            )}

            {/* Stat cards */}
            <div className="mb-6 grid grid-cols-4 gap-4">
                {[
                    { label: 'Principal', value: php(loan.amount) },
                    { label: 'Total Payable', value: php(totalPayable) },
                    { label: 'Amount Paid', value: php(totalApprovedPaid) },
                    { label: 'Remaining', value: php(remaining) },
                ].map((item, i) => (
                    <section
                        key={item.label}
                        className={`space-y-2 rounded-xl p-5 ${i % 2 === 0 ? 'bg-secondary' : 'bg-primary'}`}
                    >
                        <div className="flex size-9 items-center justify-center rounded-full bg-white">
                            <PhilippinePeso className="size-4" />
                        </div>
                        <p className="text-xs font-medium text-black/50">
                            {item.label}
                        </p>
                        <p className="text-xl font-bold">{item.value}</p>
                    </section>
                ))}
            </div>

            {/* Pending payment notice */}
            {totalPending > 0 && (
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <Hourglass className="size-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                        You have {php(totalPending)} in payments awaiting admin
                        approval. Your balance will update once approved.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* ── Left ── */}
                <div className="col-span-2 space-y-6">
                    <SectionCard icon={FileText} title="Transaction Details">
                        <div className="space-y-0.5">
                            <InfoRow
                                label="Contract No."
                                value={loan.contract_number}
                            />
                            <Separator />
                            <InfoRow
                                label="Date"
                                value={fmtDate(loan.transaction_date)}
                            />
                            <Separator />
                            <InfoRow
                                label="Status"
                                value={<StatusBadge status={loan.status} />}
                            />
                            <Separator />
                            <InfoRow
                                label="Interest Rate"
                                value={`${loan.interest_value}% per month`}
                            />
                            <Separator />
                            <InfoRow
                                label="Duration"
                                value={`${loan.loan_duration} ${loan.duration_unit}`}
                            />
                            <Separator />
                            <InfoRow
                                label="Payment Frequency"
                                value={
                                    <span className="capitalize">
                                        {loan.payment_frequency}
                                    </span>
                                }
                            />
                        </div>
                    </SectionCard>

                    {/* Progress */}
                    <SectionCard icon={TrendingUp} title="Payment Progress">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {php(totalApprovedPaid)} paid of{' '}
                                    {php(totalPayable)}
                                </span>
                                <span className="font-bold">
                                    {progress.toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-muted">
                                <div
                                    className="h-3 rounded-full bg-black transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {totalPending > 0 && (
                                <p className="text-xs text-blue-600">
                                    + {php(totalPending)} pending approval
                                </p>
                            )}
                        </div>
                    </SectionCard>

                    {/* Schedule table */}
                    <SectionCard icon={TrendingUp} title="Payment Schedule">
                        {/* Mobile */}
                        <div className="sm:hidden">
                            <Accordion type="single" collapsible>
                                {schedules.map((s, idx) => {
                                    const totalDue = scheduleTotalDue(s);
                                    const approved = approvedPaid(s);
                                    const pending = pendingPaid(s);
                                    const owed = Math.max(
                                        0,
                                        totalDue - approved,
                                    );
                                    const isPaid = s.status === 'paid';
                                    const isOverdue =
                                        !isPaid && today > s.due_date;

                                    return (
                                        <AccordionItem
                                            key={s.id}
                                            value={`s-${s.id}`}
                                            className="border-b last:border-b-0"
                                        >
                                            <AccordionTrigger
                                                className={`px-2 py-3 ${isPaid ? 'opacity-60' : ''}`}
                                            >
                                                <div className="flex w-full items-center justify-between gap-3 pr-2">
                                                    <p className="text-sm font-medium">
                                                        #{idx + 1} ·{' '}
                                                        {fmtDate(s.due_date)}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-amber-600">
                                                            {php(owed)}
                                                        </span>
                                                        <StatusBadge
                                                            status={
                                                                isOverdue
                                                                    ? 'overdue'
                                                                    : s.status
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-3 rounded-lg bg-muted/40 p-3">
                                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                                        <span className="text-muted-foreground">
                                                            Amount Due
                                                        </span>
                                                        <span className="text-right font-medium">
                                                            {php(
                                                                parseFloat(
                                                                    s.amount_due,
                                                                ),
                                                            )}
                                                        </span>
                                                        {parseFloat(
                                                            s.penalty_amount ||
                                                                '0',
                                                        ) > 0 && (
                                                            <>
                                                                <span className="text-muted-foreground">
                                                                    Penalty
                                                                </span>
                                                                <span className="text-right font-medium text-red-500">
                                                                    {php(
                                                                        parseFloat(
                                                                            s.penalty_amount!,
                                                                        ),
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                        {parseFloat(
                                                            s.rebate_amount ||
                                                                '0',
                                                        ) > 0 && (
                                                            <>
                                                                <span className="text-muted-foreground">
                                                                    Rebate
                                                                </span>
                                                                <span className="text-right font-medium text-green-600">
                                                                    -
                                                                    {php(
                                                                        parseFloat(
                                                                            s.rebate_amount!,
                                                                        ),
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                        <span className="text-muted-foreground">
                                                            Approved Paid
                                                        </span>
                                                        <span className="text-right font-medium">
                                                            {approved > 0
                                                                ? php(approved)
                                                                : '—'}
                                                        </span>
                                                        {pending > 0 && (
                                                            <>
                                                                <span className="text-muted-foreground">
                                                                    Pending
                                                                </span>
                                                                <span className="text-right font-medium text-blue-600">
                                                                    {php(
                                                                        pending,
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {!isPaid &&
                                                        !loan.is_voided && (
                                                            <Button
                                                                size="sm"
                                                                className="w-full rounded-full text-xs"
                                                                onClick={() =>
                                                                    openPayment(
                                                                        s,
                                                                    )
                                                                }
                                                            >
                                                                Pay Now
                                                            </Button>
                                                        )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </div>

                        {/* Desktop */}
                        <div className="-mx-6 hidden overflow-x-auto sm:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            #
                                        </TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead className="text-right">
                                            Amount Due
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Penalty
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Rebate
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Approved Paid
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Remaining
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.map((s, idx) => {
                                        const totalDue = scheduleTotalDue(s);
                                        const approved = approvedPaid(s);
                                        const pending = pendingPaid(s);
                                        const owed = Math.max(
                                            0,
                                            totalDue - approved,
                                        );
                                        const isPaid = s.status === 'paid';
                                        const isOverdue =
                                            !isPaid && today > s.due_date;

                                        return (
                                            <TableRow
                                                key={s.id}
                                                className={
                                                    isPaid ? 'opacity-60' : ''
                                                }
                                            >
                                                <TableCell className="text-xs font-bold text-muted-foreground">
                                                    #{idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {fmtDate(s.due_date)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {php(
                                                        parseFloat(
                                                            s.amount_due,
                                                        ),
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-red-500">
                                                    {parseFloat(
                                                        s.penalty_amount || '0',
                                                    ) > 0
                                                        ? php(
                                                              parseFloat(
                                                                  s.penalty_amount!,
                                                              ),
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right text-green-600">
                                                    {parseFloat(
                                                        s.rebate_amount || '0',
                                                    ) > 0
                                                        ? php(
                                                              parseFloat(
                                                                  s.rebate_amount!,
                                                              ),
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span>
                                                            {approved > 0
                                                                ? php(approved)
                                                                : '—'}
                                                        </span>
                                                        {pending > 0 && (
                                                            <span className="text-xs text-blue-500">
                                                                +{php(pending)}{' '}
                                                                pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-amber-600">
                                                    {php(owed)}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        status={
                                                            isOverdue
                                                                ? 'overdue'
                                                                : s.status
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {!isPaid &&
                                                        !loan.is_voided && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-full px-3 text-xs"
                                                                onClick={() =>
                                                                    openPayment(
                                                                        s,
                                                                    )
                                                                }
                                                            >
                                                                Pay
                                                            </Button>
                                                        )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </SectionCard>
                </div>

                {/* ── Right ── */}
                <div className="space-y-5">
                    {/* Quick pay */}
                    {loan.is_voided ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                <XCircle className="mb-3 size-12 text-muted-foreground/30" />
                                <p className="font-semibold text-muted-foreground">
                                    Loan Voided
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    No payments available.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <SectionCard icon={CreditCard} title="Submit Payment">
                            <div className="space-y-2">
                                {unpaidSchedules.length > 0 ? (
                                    unpaidSchedules.map((s) => {
                                        const totalDue = scheduleTotalDue(s);
                                        const approved = approvedPaid(s);
                                        const pending = pendingPaid(s);
                                        const owed = Math.max(
                                            0,
                                            totalDue - approved,
                                        );
                                        const isOverdue = today > s.due_date;
                                        const idx = getIndex(s);

                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => openPayment(s)}
                                                className="flex w-full items-center justify-between rounded-lg border border-border p-3.5 text-left transition-all hover:border-foreground/20 hover:bg-muted/40"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        Payment #{idx + 1}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Due:{' '}
                                                        {fmtDate(s.due_date)}
                                                    </p>
                                                    {pending > 0 && (
                                                        <p className="mt-0.5 text-xs text-blue-500">
                                                            {php(pending)}{' '}
                                                            awaiting approval
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-amber-600">
                                                        {php(owed)}
                                                    </p>
                                                    <StatusBadge
                                                        status={
                                                            isOverdue
                                                                ? 'overdue'
                                                                : s.status
                                                        }
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center py-6 text-center">
                                        <CheckCircle2 className="mb-2 size-8 text-green-400" />
                                        <p className="text-sm font-medium text-green-700">
                                            All payments completed!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {/* Payment History */}
                      {/* Full payment history */}
                                       <SectionCard icon={History} title="All Payment History">
                                           <div className="max-h-[500px] space-y-2 overflow-y-auto">
                                               {allHistories.length > 0 ? (
                                                   allHistories.map((h, i) => (
                                                       <div
                                                           key={i}
                                                           className="space-y-2 rounded-lg border border-border p-3"
                                                       >
                                                           <div className="flex items-start justify-between">
                                                               <div>
                                                                   <p className="text-sm font-semibold">
                                                                       Payment #{h.schedule_number}
                                                                   </p>
                                                                   <p className="text-xs text-muted-foreground">
                                                                       {fmtDate(h.payment_date)}
                                                                   </p>
                                                               </div>
                                                               <div className="text-right">
                                                                   <p
                                                                       className={`text-sm font-bold ${h.status === 'approved' ? 'text-green-600' : h.status === 'rejected' ? 'text-red-500' : 'text-blue-600'}`}
                                                                   >
                                                                       {php(
                                                                           parseFloat(
                                                                               h.amount_paid,
                                                                           ),
                                                                       )}
                                                                   </p>
                                                                   <StatusBadge
                                                                       status={h.status}
                                                                   />
                                                               </div>
                                                           </div>
                                                           <Separator />
                                                           <div className="space-y-1 text-xs">
                                                               <div className="flex justify-between">
                                                                   <span className="text-muted-foreground">
                                                                       Method
                                                                   </span>
                                                                   <span className="font-medium capitalize">
                                                                       {h.payment_method}
                                                                   </span>
                                                               </div>
                                                               {h.reference_number && (
                                                                   <div className="flex justify-between">
                                                                       <span className="text-muted-foreground">
                                                                           Ref #
                                                                       </span>
                                                                       <span className="font-medium">
                                                                           {h.reference_number}
                                                                       </span>
                                                                   </div>
                                                               )}
                                                               {h.receipt_number && (
                                                                   <div className="flex justify-between">
                                                                       <span className="text-muted-foreground">
                                                                           Receipt #
                                                                       </span>
                                                                       <span className="font-medium">
                                                                           {h.receipt_number}
                                                                       </span>
                                                                   </div>
                                                               )}
                                                               {h.remarks && (
                                                                   <div className="flex justify-between">
                                                                       <span className="text-muted-foreground">
                                                                           Remarks
                                                                       </span>
                                                                       <span className="max-w-[60%] text-right font-medium">
                                                                           {h.remarks}
                                                                       </span>
                                                                   </div>
                                                               )}
                                                           </div>
                   
                                                           {/* Attachments in history card */}
                                                           {h.attachments?.length > 0 && (
                                                               <AttachmentGrid
                                                                   attachments={
                                                                       h.attachments
                                                                   }
                                                               />
                                                           )}
                                                       </div>
                                                   ))
                                               ) : (
                                                   <p className="py-8 text-center text-sm text-muted-foreground">
                                                       No payment history yet
                                                   </p>
                                               )}
                                           </div>
                                       </SectionCard>
                </div>
            </div>

            {/* Modals */}
            <VoidModal
                open={isVoidOpen}
                onClose={() => setIsVoidOpen(false)}
                loanId={loan.id}
            />
            <PaymentModal
                open={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    setSelected(null);
                }}
                schedule={selected}
                scheduleIndex={selected ? getIndex(selected) : 0}
            />
        </div>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaymentAttachment {
    id: number;
    payment_history_id: number;
    image_path: string; // relative path, e.g. attachments/5/receipt.jpg
}


function AttachmentGrid({ attachments }: { attachments: PaymentAttachment[] }) {
    const [lightbox, setLightbox] = useState<string | null>(null);

    if (!attachments || attachments.length === 0) return null;

    return (
        <>
            <div className="mt-2 space-y-1.5">
                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Paperclip className="size-3" />
                    Attachments ({attachments.length})
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                    {attachments.map((att) => {
                        const url = storageUrl(att.image_path);
                        const pdf = isPdf(att.image_path);
                        return (
                            <div
                                key={att.id}
                                className="group relative overflow-hidden rounded-lg border border-border bg-muted/40"
                            >
                                {pdf ? (
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-16 flex-col items-center justify-center gap-1 text-center"
                                    >
                                        <FileIcon className="size-5 text-red-500" />
                                        <span className="text-[9px] text-muted-foreground">
                                            PDF
                                        </span>
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setLightbox(url)}
                                        className="relative h-16 w-full"
                                    >
                                        <img
                                            src={url}
                                            alt="attachment"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                                            <ZoomIn className="size-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <Dialog open onOpenChange={() => setLightbox(null)}>
                    <DialogContent className="max-w-3xl border-0 bg-black/90 p-2">
                        <button
                            onClick={() => setLightbox(null)}
                            className="absolute top-3 right-3 z-10 flex size-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40"
                        >
                            <X className="size-4" />
                        </button>
                        <img
                            src={lightbox}
                            alt="attachment preview"
                            className="max-h-[80vh] w-full rounded object-contain"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
