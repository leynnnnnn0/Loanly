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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    CheckCircle,
    Clock,
    CreditCard,
    PhilippinePeso,
    FileText,
    History,
    AlertTriangle,
    TrendingUp,
    XCircle,
    Check,
    X,
    Gift,
    ShieldCheck,
    Paperclip,
    ZoomIn,
    FileIcon,
} from 'lucide-react';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaymentAttachment {
    id: number;
    payment_history_id: number;
    image_path: string; // relative path, e.g. attachments/5/receipt.jpg
}

interface PaymentHistory {
    id: number;
    payment_schedule_id: number;
    amount_paid: string;
    payment_method: string;
    reference_number: string | null;
    receipt_number: string | null;
    payment_date: string;
    status: string;
    remarks: string | null;
    attachments: PaymentAttachment[];
}

interface PaymentSchedule {
    id: number;
    due_date: string;
    amount_due: string;
    penalty_amount: string | null;
    rebate_amount: string | null;
    rebate_remarks: string | null;
    status: string;
    payment_histories: PaymentHistory[];
}

interface Borrower {
    full_name: string;
    first_name: string;
    last_name: string;
    address: string;
    contact_number: string;
    phone_number: string;
}

interface Loan {
    id: number;
    contract_number: string;
    transaction_date: string;
    status: string;
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
    reason: string;
    payment_schedules: PaymentSchedule[];
    borrower: Borrower;
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

function scheduleTotalDue(s: PaymentSchedule): number {
    return (
        parseFloat(s.amount_due || '0') +
        parseFloat(s.penalty_amount || '0') -
        parseFloat(s.rebate_amount || '0')
    );
}

function approvedPaid(s: PaymentSchedule): number {
    return (s.payment_histories ?? [])
        .filter((h) => h.status === 'approved')
        .reduce((sum, h) => sum + parseFloat(h.amount_paid || '0'), 0);
}

/** Resolve a storage path to a public URL */
function storageUrl(path: string): string {
    return `/storage/${path}`;
}

function isPdf(path: string): boolean {
    return path.toLowerCase().endsWith('.pdf');
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

// ─── Attachment Grid ───────────────────────────────────────────────────────────
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

// ─── Approve Loan Modal ────────────────────────────────────────────────────────
function ApproveLoanModal({
    open,
    onClose,
    loan,
}: {
    open: boolean;
    onClose: () => void;
    loan: Loan;
}) {
    const { post, processing } = useForm({});
    function handleApprove() {
        post(`/admin/loans/${loan.id}/approve`, { onSuccess: onClose });
    }
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-green-600" />{' '}
                        Approve Loan
                    </DialogTitle>
                    <DialogDescription>
                        Approving this loan will activate it and allow the
                        borrower to make payments.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-1.5 rounded-lg border bg-muted/40 p-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Borrower</span>
                        <span className="font-medium">
                            {loan.borrower?.full_name}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Contract</span>
                        <span className="font-medium">
                            {loan.contract_number}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold">{php(loan.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">
                            {loan.loan_duration} {loan.duration_unit}
                        </span>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={processing}
                        onClick={handleApprove}
                        className="rounded-full bg-green-600 text-white hover:bg-green-700"
                    >
                        {processing ? 'Approving…' : 'Approve Loan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Reject Loan Modal ─────────────────────────────────────────────────────────
function RejectLoanModal({
    open,
    onClose,
    loan,
}: {
    open: boolean;
    onClose: () => void;
    loan: Loan;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        void_reason: '',
    });
    function handleReject() {
        post(`/admin/loans/${loan.id}/reject`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ban className="size-4 text-red-500" /> Reject Loan
                    </DialogTitle>
                    <DialogDescription>
                        Provide a reason for rejecting this application.
                    </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertDescription>
                        The borrower will be notified of the rejection.
                    </AlertDescription>
                </Alert>
                <div className="space-y-1.5">
                    <Label>Reason *</Label>
                    <Textarea
                        placeholder="Enter rejection reason..."
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
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={processing || !data.void_reason.trim()}
                        onClick={handleReject}
                        className="rounded-full"
                    >
                        {processing ? 'Rejecting…' : 'Reject Loan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Approve Payment Modal ─────────────────────────────────────────────────────
function ApprovePaymentModal({
    open,
    onClose,
    history,
}: {
    open: boolean;
    onClose: () => void;
    history:
        | (PaymentHistory & { schedule_number: number; due_date: string })
        | null;
}) {
    const { post, processing } = useForm({});
    function handleApprove() {
        if (!history) return;
        post(`/admin/payments/${history.id}/approve`, { onSuccess: onClose });
    }
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Check className="size-4 text-green-600" /> Approve
                        Payment
                    </DialogTitle>
                    <DialogDescription>
                        Approving will deduct this amount from the borrower's
                        balance. Overpayment cascades to next schedule.
                    </DialogDescription>
                </DialogHeader>

                {history && (
                    <>
                        <div className="space-y-1.5 rounded-lg border bg-muted/40 p-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Schedule
                                </span>
                                <span className="font-medium">
                                    Payment #{history.schedule_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Due Date
                                </span>
                                <span className="font-medium">
                                    {fmtDate(history.due_date)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Amount
                                </span>
                                <span className="font-bold text-green-600">
                                    {php(parseFloat(history.amount_paid))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Method
                                </span>
                                <span className="font-medium capitalize">
                                    {history.payment_method}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Date Paid
                                </span>
                                <span className="font-medium">
                                    {fmtDate(history.payment_date)}
                                </span>
                            </div>
                            {history.reference_number && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Ref #
                                    </span>
                                    <span className="font-medium">
                                        {history.reference_number}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Attachments inside the approval modal */}
                        {history.attachments?.length > 0 && (
                            <div className="rounded-lg border p-3">
                                <AttachmentGrid
                                    attachments={history.attachments}
                                />
                            </div>
                        )}
                    </>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={processing}
                        onClick={handleApprove}
                        className="rounded-full bg-green-600 text-white hover:bg-green-700"
                    >
                        {processing ? 'Approving…' : 'Approve Payment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Reject Payment Modal ──────────────────────────────────────────────────────
function RejectPaymentModal({
    open,
    onClose,
    history,
}: {
    open: boolean;
    onClose: () => void;
    history: (PaymentHistory & { schedule_number: number }) | null;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        remarks: '',
    });
    function handleReject() {
        if (!history) return;
        post(`/admin/payments/${history.id}/reject`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <X className="size-4 text-red-500" /> Reject Payment
                    </DialogTitle>
                    <DialogDescription>
                        Payment #{history?.schedule_number} —{' '}
                        {history ? php(parseFloat(history.amount_paid)) : ''}
                    </DialogDescription>
                </DialogHeader>

                {/* Show attachments in reject modal too */}
                {history?.attachments?.length > 0 && (
                    <div className="rounded-lg border p-3">
                        <AttachmentGrid attachments={history.attachments} />
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label>Remarks (Optional)</Label>
                    <Textarea
                        placeholder="Reason for rejection..."
                        className="min-h-[80px] resize-none"
                        value={data.remarks}
                        onChange={(e) => setData('remarks', e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={processing}
                        onClick={handleReject}
                        className="rounded-full"
                    >
                        {processing ? 'Rejecting…' : 'Reject Payment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Rebate Modal ──────────────────────────────────────────────────────────────
function RebateModal({
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
    const isEdit = !!(
        schedule?.rebate_amount && parseFloat(schedule.rebate_amount) > 0
    );
    const { data, setData, post, put, processing, errors, reset } = useForm({
        rebate_amount: schedule?.rebate_amount ?? '',
        rebate_remarks: schedule?.rebate_remarks ?? '',
    });
    function handleSubmit() {
        if (!schedule) return;
        const url = `/admin/loans/schedules/${schedule.id}/rebate`;
        const opts = {
            onSuccess: () => {
                reset();
                onClose();
            },
        };
        isEdit ? put(url, opts) : post(url, opts);
    }
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Gift className="size-4 text-purple-600" />
                        {isEdit ? 'Edit Rebate' : 'Add Rebate'}
                    </DialogTitle>
                    <DialogDescription>
                        Payment #{scheduleIndex + 1} — Due:{' '}
                        {schedule ? fmtDate(schedule.due_date) : ''}
                    </DialogDescription>
                </DialogHeader>
                {isEdit && schedule?.rebate_amount && (
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                        <p className="text-xs text-purple-600">
                            Current Rebate
                        </p>
                        <p className="text-lg font-bold text-purple-800">
                            {php(parseFloat(schedule.rebate_amount))}
                        </p>
                        {schedule.rebate_remarks && (
                            <p className="mt-1 text-xs text-purple-600">
                                {schedule.rebate_remarks}
                            </p>
                        )}
                    </div>
                )}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>
                            {isEdit ? 'New Rebate Amount' : 'Rebate Amount'} *
                        </Label>
                        <div className="relative">
                            <span className="absolute top-2.5 left-3 text-sm text-muted-foreground">
                                ₱
                            </span>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-7"
                                value={data.rebate_amount}
                                onChange={(e) =>
                                    setData('rebate_amount', e.target.value)
                                }
                            />
                        </div>
                        {errors.rebate_amount && (
                            <p className="text-xs text-destructive">
                                {errors.rebate_amount}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Remarks</Label>
                        <Textarea
                            placeholder="Reason for rebate..."
                            className="min-h-[80px] resize-none"
                            value={data.rebate_remarks}
                            onChange={(e) =>
                                setData('rebate_remarks', e.target.value)
                            }
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={processing || !data.rebate_amount}
                        onClick={handleSubmit}
                        className="rounded-full bg-purple-600 text-white hover:bg-purple-700"
                    >
                        {processing
                            ? 'Saving…'
                            : isEdit
                              ? 'Update Rebate'
                              : 'Add Rebate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Penalty Modal ─────────────────────────────────────────────────────────────
function PenaltyModal({
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
    const isEdit = !!(
        schedule?.penalty_amount && parseFloat(schedule.penalty_amount) > 0
    );
    const { data, setData, post, put, processing, errors, reset } = useForm({
        penalty_amount: schedule?.penalty_amount ?? '',
        remarks: '',
    });
    function handleSubmit() {
        if (!schedule) return;
        const url = `/admin/loans/schedules/${schedule.id}/penalty`;
        const opts = {
            onSuccess: () => {
                reset();
                onClose();
            },
        };
        isEdit ? put(url, opts) : post(url, opts);
    }
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle
                            className={`size-4 ${isEdit ? 'text-amber-600' : 'text-red-500'}`}
                        />
                        {isEdit ? 'Edit Penalty' : 'Add Penalty'}
                    </DialogTitle>
                    <DialogDescription>
                        Payment #{scheduleIndex + 1} — Due:{' '}
                        {schedule ? fmtDate(schedule.due_date) : ''}
                    </DialogDescription>
                </DialogHeader>
                {isEdit && schedule?.penalty_amount && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs text-amber-600">
                            Current Penalty
                        </p>
                        <p className="text-lg font-bold text-amber-800">
                            {php(parseFloat(schedule.penalty_amount))}
                        </p>
                    </div>
                )}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>
                            {isEdit ? 'New Penalty Amount' : 'Penalty Amount'} *
                        </Label>
                        <div className="relative">
                            <span className="absolute top-2.5 left-3 text-sm text-muted-foreground">
                                ₱
                            </span>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-7"
                                value={data.penalty_amount}
                                onChange={(e) =>
                                    setData('penalty_amount', e.target.value)
                                }
                            />
                        </div>
                        {errors.penalty_amount && (
                            <p className="text-xs text-destructive">
                                {errors.penalty_amount}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Remarks (Optional)</Label>
                        <Textarea
                            placeholder="Reason for penalty..."
                            className="min-h-[80px] resize-none"
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={processing || !data.penalty_amount}
                        onClick={handleSubmit}
                        className={`rounded-full ${isEdit ? '' : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                        {processing
                            ? 'Saving…'
                            : isEdit
                              ? 'Update Penalty'
                              : 'Add Penalty'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Admin Show Page ───────────────────────────────────────────────────────────
export default function AdminLoanShow({ loan }: { loan: Loan }) {
    const [approveLoanOpen, setApproveLoanOpen] = useState(false);
    const [rejectLoanOpen, setRejectLoanOpen] = useState(false);
    const [approvePayOpen, setApprovePayOpen] = useState(false);
    const [rejectPayOpen, setRejectPayOpen] = useState(false);
    const [rebateOpen, setRebateOpen] = useState(false);
    const [penaltyOpen, setPenaltyOpen] = useState(false);

    type HistoryWithMeta = PaymentHistory & {
        schedule_number: number;
        due_date: string;
    };

    const [selectedHistory, setSelectedHistory] =
        useState<HistoryWithMeta | null>(null);
    const [selectedSchedule, setSelectedSchedule] =
        useState<PaymentSchedule | null>(null);

    const schedules = loan.payment_schedules ?? [];

    const totalPayable = schedules.reduce((s, x) => s + scheduleTotalDue(x), 0);
    const totalApprovedPaid = schedules.reduce(
        (s, x) => s + approvedPaid(x),
        0,
    );
    const totalPendingPay = schedules.reduce(
        (s, x) =>
            s +
            (x.payment_histories ?? [])
                .filter((h) => h.status === 'for_approval')
                .reduce((a, h) => a + parseFloat(h.amount_paid || '0'), 0),
        0,
    );
    const remaining = Math.max(0, totalPayable - totalApprovedPaid);
    const progress =
        totalPayable > 0
            ? Math.min((totalApprovedPaid / totalPayable) * 100, 100)
            : 0;

    const allHistories: HistoryWithMeta[] = schedules
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

    const pendingPayments = allHistories.filter(
        (h) => h.status === 'for_approval',
    );

    function getScheduleIndex(s: PaymentSchedule) {
        return schedules.findIndex((x) => x.id === s.id);
    }

    function openApprovePayment(h: HistoryWithMeta) {
        setSelectedHistory(h);
        setApprovePayOpen(true);
    }
    function openRejectPayment(h: HistoryWithMeta) {
        setSelectedHistory(h);
        setRejectPayOpen(true);
    }
    function openRebate(s: PaymentSchedule) {
        setSelectedSchedule(s);
        setRebateOpen(true);
    }
    function openPenalty(s: PaymentSchedule) {
        setSelectedSchedule(s);
        setPenaltyOpen(true);
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="p-10">
            {/* Header */}
            <div className="flex items-center justify-between py-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-medium">
                            Loan Management
                        </h1>
                        <Badge variant="outline" className="text-xs">
                            Admin
                        </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Contract #{loan.contract_number}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {loan.status === 'pending' && !loan.is_voided && (
                        <>
                            <Button
                                onClick={() => setApproveLoanOpen(true)}
                                className="rounded-full bg-green-600 text-white hover:bg-green-700"
                            >
                                <CheckCircle className="size-4" /> Approve Loan
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setRejectLoanOpen(true)}
                                className="rounded-full"
                            >
                                <X className="size-4" /> Reject Loan
                            </Button>
                        </>
                    )}
                    <Button variant="outline" className="rounded-full" asChild>
                        <Link href="/admin/loans">
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
                    { label: 'Approved Paid', value: php(totalApprovedPaid) },
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

            <div className="grid grid-cols-3 gap-6">
                {/* ── Left ── */}
                <div className="col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                        <SectionCard icon={FileText} title="Loan Details">
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
                                    label="Amount"
                                    value={php(loan.amount)}
                                />
                                <Separator />
                                <InfoRow
                                    label="Interest"
                                    value={`${loan.interest_value}% / month`}
                                />
                                <Separator />
                                <InfoRow
                                    label="Duration"
                                    value={`${loan.loan_duration} ${loan.duration_unit}`}
                                />
                                <Separator />
                                <InfoRow
                                    label="Frequency"
                                    value={
                                        <span className="capitalize">
                                            {loan.payment_frequency}
                                        </span>
                                    }
                                />
                                <Separator />
                                <InfoRow label="Reason" value={loan.reason} />
                            </div>
                        </SectionCard>
                        <SectionCard icon={FileText} title="Borrower">
                            <div className="space-y-0.5">
                                <InfoRow
                                    label="Name"
                                    value={
                                        loan.borrower?.first_name +
                                        ' ' +
                                        loan.borrower?.last_name
                                    }
                                />
                                <Separator />
                                <InfoRow
                                    label="Address"
                                    value={loan.borrower?.address}
                                />
                                <Separator />
                                <InfoRow
                                    label="Contact"
                                    value={loan.borrower?.phone_number || '—'}
                                />
                            </div>
                        </SectionCard>
                    </div>

                    {/* Progress */}
                    <SectionCard icon={TrendingUp} title="Payment Progress">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {php(totalApprovedPaid)} approved of{' '}
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
                            {totalPendingPay > 0 && (
                                <p className="text-xs text-blue-600">
                                    + {php(totalPendingPay)} pending approval
                                </p>
                            )}
                        </div>
                    </SectionCard>

                    {/* Payment Schedule */}
                    <SectionCard icon={TrendingUp} title="Payment Schedule">
                        <p className="mb-4 text-xs text-muted-foreground">
                            Click <strong>Penalty</strong> or{' '}
                            <strong>Rebate</strong> buttons to manage
                            adjustments per schedule.
                        </p>
                        <div className="-mx-6 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
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
                                            Total Due
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Paid
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.map((s, idx) => {
                                        const totalDue = scheduleTotalDue(s);
                                        const approved = approvedPaid(s);
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
                                                <TableCell className="text-right font-semibold">
                                                    {php(totalDue)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {approved > 0
                                                        ? php(approved)
                                                        : '—'}
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
                                                    {!loan.is_voided &&
                                                        loan.status ===
                                                            'active' && (
                                                            <div className="flex gap-1.5">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="rounded-full border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50"
                                                                    onClick={() =>
                                                                        openPenalty(
                                                                            s,
                                                                        )
                                                                    }
                                                                >
                                                                    {parseFloat(
                                                                        s.penalty_amount ||
                                                                            '0',
                                                                    ) > 0
                                                                        ? 'Edit Penalty'
                                                                        : 'Penalty'}
                                                                </Button>
                                                            </div>
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
                    {/* Payments for approval */}
                    <SectionCard
                        icon={CreditCard}
                        title="Payments for Approval"
                    >
                        <div className="space-y-2">
                            {pendingPayments.length > 0 ? (
                                pendingPayments.map((h, i) => (
                                    <div
                                        key={i}
                                        className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3.5"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Payment #{h.schedule_number}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Paid:{' '}
                                                    {fmtDate(h.payment_date)}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    via {h.payment_method}
                                                </p>
                                                {h.reference_number && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Ref:{' '}
                                                        {h.reference_number}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-lg font-bold text-blue-700">
                                                {php(parseFloat(h.amount_paid))}
                                            </p>
                                        </div>

                                        {/* Attachment thumbnails in the pending card */}
                                        {h.attachments?.length > 0 && (
                                            <AttachmentGrid
                                                attachments={
                                                    h.attachments
                                                }
                                            />
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 rounded-full bg-green-600 text-xs text-white hover:bg-green-700"
                                                onClick={() =>
                                                    openApprovePayment(h)
                                                }
                                            >
                                                <Check className="size-3" />{' '}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="flex-1 rounded-full text-xs"
                                                onClick={() =>
                                                    openRejectPayment(h)
                                                }
                                            >
                                                <X className="size-3" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center py-6 text-center">
                                    <CheckCircle className="mb-2 size-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        No pending payments
                                    </p>
                                </div>
                            )}
                        </div>
                    </SectionCard>

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
            <ApproveLoanModal
                open={approveLoanOpen}
                onClose={() => setApproveLoanOpen(false)}
                loan={loan}
            />
            <RejectLoanModal
                open={rejectLoanOpen}
                onClose={() => setRejectLoanOpen(false)}
                loan={loan}
            />
            <ApprovePaymentModal
                open={approvePayOpen}
                onClose={() => {
                    setApprovePayOpen(false);
                    setSelectedHistory(null);
                }}
                history={selectedHistory}
            />
            <RejectPaymentModal
                open={rejectPayOpen}
                onClose={() => {
                    setRejectPayOpen(false);
                    setSelectedHistory(null);
                }}
                history={selectedHistory}
            />
            <RebateModal
                open={rebateOpen}
                onClose={() => {
                    setRebateOpen(false);
                    setSelectedSchedule(null);
                }}
                schedule={selectedSchedule}
                scheduleIndex={
                    selectedSchedule ? getScheduleIndex(selectedSchedule) : 0
                }
            />
            <PenaltyModal
                open={penaltyOpen}
                onClose={() => {
                    setPenaltyOpen(false);
                    setSelectedSchedule(null);
                }}
                schedule={selectedSchedule}
                scheduleIndex={
                    selectedSchedule ? getScheduleIndex(selectedSchedule) : 0
                }
            />
        </div>
    );
}
