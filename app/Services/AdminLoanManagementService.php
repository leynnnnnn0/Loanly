<?php

namespace App\Services;

use App\Mail\LoanApprovedMail;
use App\Models\Loan;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class AdminLoanManagementService
{
    public function __construct(private readonly LoanNotificationService $notifications) {}

    /**
     * @return array<string, mixed>
     */
    public function indexData(Request $request): array
    {
        $loans = Loan::with(['borrower', 'payment_schedules.payment_histories'])
            ->when($request->status, fn ($query) => $query->where('status', $request->status))
            ->when($request->search, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('contract_number', 'like', "%{$search}%")
                        ->orWhereHas(
                            'borrower',
                            fn ($borrowerQuery) => $borrowerQuery
                                ->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                        );
                });
            })
            ->latest()
            ->paginate(8)
            ->through(fn (Loan $loan) => $this->loanRow($loan));

        return [
            'loans' => $loans,
            'filters' => $request->only('status', 'search'),
        ];
    }

    public function findForShow(int|string $id): Loan
    {
        return Loan::with([
            'attachments',
            'borrower',
            'payment_schedules.payment_histories.attachments',
        ])->findOrFail($id);
    }

    public function approveLoan(int|string $id): Loan
    {
        $loan = Loan::with(['borrower.user', 'payment_schedules'])->findOrFail($id);
        abort_if($loan->status !== 'pending' || $loan->is_voided, 422, 'Cannot approve this loan.');

        $loan->update(['status' => 'active']);
        $this->queuePromissoryNote($loan);
        $this->notifications->loanApproved($loan);

        return $loan;
    }

    public function rejectLoan(int|string $id, string $reason): Loan
    {
        $loan = Loan::findOrFail($id);
        abort_if($loan->status !== 'pending' || $loan->is_voided, 422, 'Cannot reject this loan.');

        DB::transaction(function () use ($loan, $reason) {
            $loan->update([
                'status' => 'rejected',
                'remarks' => $reason,
            ]);

            $loan->payment_schedules()
                ->where('status', 'pending')
                ->update(['status' => 'cancelled']);
        });

        $this->notifications->loanRejected($loan->fresh(['borrower.user']));

        return $loan;
    }

    public function approvePayment(int|string $historyId): void
    {
        $history = PaymentHistory::findOrFail($historyId);
        abort_if($history->status !== 'for_approval', 422, 'Payment is not pending approval.');

        DB::transaction(function () use ($history) {
            $history->update(['status' => 'approved']);

            $schedule = PaymentSchedule::findOrFail($history->payment_schedule_id);
            $loan = Loan::with('payment_schedules')->findOrFail($schedule->loan_id);
            $approvedAmount = $this->approvedAmount($schedule);
            $totalDue = $this->scheduleTotalDue($schedule);
            $excess = max(0, $approvedAmount - $totalDue);

            if ($approvedAmount >= $totalDue) {
                $schedule->update(['status' => 'paid']);
            }

            if ($excess > 0.001) {
                $history->update(['amount_paid' => $history->amount_paid - $excess]);
                $this->cascadeExcessPayment($loan, $schedule, $history, $excess);
            }

            $this->completeLoanWhenPaid($loan);
        });

        $this->notifications->paymentApproved($history->fresh('payment_schedule.loan.borrower.user'));
    }

    public function rejectPayment(int|string $historyId, ?string $remarks): void
    {
        $history = PaymentHistory::findOrFail($historyId);
        abort_if($history->status !== 'for_approval', 422, 'Payment is not pending approval.');

        $history->update([
            'status' => 'rejected',
            'remarks' => $remarks,
        ]);

        $this->notifications->paymentRejected($history->fresh('payment_schedule.loan.borrower.user'));
    }

    public function savePenalty(int|string $scheduleId, float|int|string $amount): void
    {
        $schedule = $this->editableSchedule($scheduleId);
        $schedule->update(['penalty_amount' => $amount]);
        $this->notifications->penaltyUpdated($schedule->fresh('loan.borrower.user'));
    }

    public function saveRebate(int|string $scheduleId, float|int|string $amount, ?string $remarks): void
    {
        $schedule = $this->editableSchedule($scheduleId);
        $schedule->update([
            'rebate_amount' => $amount,
            'rebate_remarks' => $remarks,
        ]);

        $this->markSchedulePaidIfSettled($schedule->fresh());
        $this->notifications->rebateUpdated($schedule->fresh('loan.borrower.user'));
    }

    /**
     * @return array<string, mixed>
     */
    private function loanRow(Loan $loan): array
    {
        $totalPayable = $loan->payment_schedules->sum(fn (PaymentSchedule $schedule) => $this->scheduleTotalDue($schedule));
        $totalApproved = $loan->payment_schedules->sum(fn (PaymentSchedule $schedule) => $schedule->payment_histories
            ->where('status', 'approved')
            ->sum('amount_paid'));
        $pendingPayments = $loan->payment_schedules->sum(fn (PaymentSchedule $schedule) => $schedule->payment_histories
            ->where('status', 'for_approval')
            ->count());

        return [
            'id' => $loan->id,
            'contract_number' => $loan->contract_number,
            'borrower_name' => $loan->borrower?->full_name,
            'amount' => (float) $loan->amount,
            'total_payable' => (float) $totalPayable,
            'total_paid' => (float) $totalApproved,
            'remaining' => (float) max(0, $totalPayable - $totalApproved),
            'status' => $loan->status,
            'is_voided' => $loan->is_voided,
            'transaction_date' => $loan->transaction_date,
            'pending_payments' => (int) $pendingPayments,
            'payment_frequency' => $loan->payment_frequency,
            'loan_duration' => $loan->loan_duration,
            'duration_unit' => $loan->duration_unit,
        ];
    }

    private function queuePromissoryNote(Loan $loan): void
    {
        $borrower = $loan->borrower;
        $email = $borrower->user->email ?? null;

        if (! $email) {
            return;
        }

        $lender = (object) [
            'business_name' => config('app.lender_name', 'YOUR LENDING COMPANY'),
        ];

        $pdfContent = Pdf::loadView(
            'promissory-note',
            compact('loan', 'borrower', 'lender')
        )->setPaper('a4', 'portrait')->output();

        Mail::to($email)->queue(
            (new LoanApprovedMail($loan))->withPdfContent(base64_encode($pdfContent))
        );
    }

    private function cascadeExcessPayment(
        Loan $loan,
        PaymentSchedule $currentSchedule,
        PaymentHistory $sourceHistory,
        float $excess
    ): void {
        $nextSchedules = $loan->payment_schedules()
            ->whereIn('status', ['pending', 'overdue'])
            ->where('id', '!=', $currentSchedule->id)
            ->orderBy('due_date')
            ->get();

        foreach ($nextSchedules as $nextSchedule) {
            if ($excess < 0.001) {
                break;
            }

            $stillOwed = max(0, $this->scheduleTotalDue($nextSchedule) - $this->approvedAmount($nextSchedule));

            if ($stillOwed < 0.001) {
                $nextSchedule->update(['status' => 'paid']);

                continue;
            }

            $amountToApply = min($excess, $stillOwed);
            PaymentHistory::create([
                'payment_schedule_id' => $nextSchedule->id,
                'amount_paid' => round($amountToApply, 2),
                'payment_method' => $sourceHistory->payment_method,
                'payment_date' => $sourceHistory->payment_date,
                'reference_number' => $sourceHistory->reference_number,
                'receipt_number' => null,
                'status' => 'approved',
            ]);

            if ($amountToApply >= $stillOwed) {
                $nextSchedule->update(['status' => 'paid']);
            }

            $excess -= $amountToApply;
        }
    }

    private function markSchedulePaidIfSettled(PaymentSchedule $schedule): void
    {
        $totalApproved = $this->approvedAmount($schedule);
        $totalDue = $this->scheduleTotalDue($schedule);

        if ($totalApproved < $totalDue || $totalDue <= 0) {
            return;
        }

        $schedule->update(['status' => 'paid']);
        $this->completeLoanWhenPaid($schedule->loan);
    }

    private function completeLoanWhenPaid(Loan $loan): void
    {
        if ($loan->payment_schedules()->whereNotIn('status', ['paid', 'cancelled'])->doesntExist()) {
            $loan->update(['status' => 'completed']);
        }
    }

    private function editableSchedule(int|string $scheduleId): PaymentSchedule
    {
        $schedule = PaymentSchedule::findOrFail($scheduleId);
        abort_if($schedule->status === 'paid', 422, 'Cannot modify a paid schedule.');

        return $schedule;
    }

    private function approvedAmount(PaymentSchedule $schedule): float
    {
        return (float) PaymentHistory::where('payment_schedule_id', $schedule->id)
            ->where('status', 'approved')
            ->sum('amount_paid');
    }

    private function scheduleTotalDue(PaymentSchedule $schedule): float
    {
        return (float) $schedule->amount_due
            + (float) ($schedule->penalty_amount ?? 0)
            - (float) ($schedule->rebate_amount ?? 0);
    }
}
