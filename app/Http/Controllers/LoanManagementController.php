<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Mail\LoanApprovedMail;
use Illuminate\Support\Facades\Mail;

class LoanManagementController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // Index
    // ─────────────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $loans = Loan::with(['borrower', 'payment_schedules.payment_histories'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when(
                $request->search,
                fn($q) =>
                $q->where('contract_number', 'like', "%{$request->search}%")
                    ->orWhereHas(
                        'borrower',
                        fn($q2) =>
                        $q2->where('full_name', 'like', "%{$request->search}%")
                    )
            )
            ->latest()
            ->paginate(20)
            ->through(function ($loan) {
                $totalPayable  = $loan->payment_schedules->sum(fn($s) =>
                (float)$s->amount_due + (float)($s->penalty_amount ?? 0) - (float)($s->rebate_amount ?? 0));

                $totalApproved = $loan->payment_schedules->sum(fn($s) =>
                $s->payment_histories->where('status', 'approved')->sum('amount_paid'));

                $pendingCount  = $loan->payment_schedules->sum(fn($s) =>
                $s->payment_histories->where('status', 'for_approval')->count());

                return [
                    'id'               => $loan->id,
                    'contract_number'  => $loan->contract_number,
                    'borrower_name'    => $loan->borrower?->full_name,
                    'amount'           => (float) $loan->amount,
                    'total_payable'    => (float) $totalPayable,
                    'total_paid'       => (float) $totalApproved,
                    'remaining'        => (float) max(0, $totalPayable - $totalApproved),
                    'status'           => $loan->status,
                    'is_voided'        => $loan->is_voided,
                    'transaction_date' => $loan->transaction_date,
                    'pending_payments' => (int) $pendingCount,
                    'payment_frequency' => $loan->payment_frequency,
                    'loan_duration'    => $loan->loan_duration,
                    'duration_unit'    => $loan->duration_unit,
                ];
            });

        return Inertia::render('Admin/LoanManagement/Index', [
            'loans'   => $loans,
            'filters' => $request->only('status', 'search'),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Show
    // ─────────────────────────────────────────────────────────────────────────
    public function show($id)
    {
        $loan = Loan::with([
            'borrower',
            'payment_schedules.payment_histories.attachments', 
        ])->findOrFail($id);

        return Inertia::render('Admin/LoanManagement/Show', ['loan' => $loan]);
    }
    public function approveLoan($id)
    {
        $loan = Loan::with('borrower')->findOrFail($id);
        abort_if($loan->status !== 'pending' || $loan->is_voided, 422, 'Cannot approve this loan.');

        $loan->update(['status' => 'active']);

        if ($loan->borrower->user->email) {
            Mail::to($loan->borrower->user->email)->send(new LoanApprovedMail($loan));
        }

        return back()->with('success', "Loan {$loan->contract_number} approved.");
    }

    public function rejectLoan(Request $request, $id)
    {
        $loan = Loan::findOrFail($id);
        abort_if($loan->status !== 'pending' || $loan->is_voided, 422, 'Cannot reject this loan.');

        $validated = $request->validate(['void_reason' => 'required|string|max:500']);



        DB::transaction(function () use ($loan, $validated) {
            $loan->update([
                'status'      => 'voided',
                'is_voided'   => true,
                'voided_at'   => now(),
                'remarks' => $validated['void_reason'],
            ]);
            $loan->payment_schedules()->where('status', 'pending')->update(['status' => 'cancelled']);
        });

        return back()->with('success', "Loan {$loan->contract_number} rejected.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Approve Payment — with proper overpayment cascade
    //
    // Algorithm:
    //   1. Mark the payment_history as approved.
    //   2. Walk all non-paid schedules in due-date order.
    //   3. For each schedule, compute what is still owed
    //      (totalDue - sum of ALL approved payments on that schedule).
    //   4. If the running excess fully covers stillOwed → mark schedule paid,
    //      subtract stillOwed from excess, continue to next.
    //   5. If excess is less than stillOwed → schedule stays pending (partial).
    //      Create a carryover PaymentHistory record on that schedule so the
    //      partial credit is visible and trackable. Stop.
    //   6. If excess reaches 0 before all schedules are exhausted → stop.
    // ─────────────────────────────────────────────────────────────────────────
    public function approvePayment($historyId)
    {
        $history = PaymentHistory::findOrFail($historyId);
        abort_if($history->status !== 'for_approval', 422, 'Payment is not pending approval.');

        DB::transaction(function () use ($history) {
            $history->update(['status' => 'approved']);

            $schedule = PaymentSchedule::findOrFail($history->payment_schedule_id);
            $loan     = Loan::with('payment_schedules')->findOrFail($schedule->loan_id);

            $targetApproved = (float) PaymentHistory::where('payment_schedule_id', $schedule->id)
                ->where('status', 'approved')
                ->sum('amount_paid');

            $targetTotalDue = $this->scheduleTotalDue($schedule);
            $excess = max(0, $targetApproved - $targetTotalDue);

            if ($targetApproved >= $targetTotalDue) {
                $schedule->update(['status' => 'paid']);
            }

            if ($excess > 0.001) {
                $nextSchedules = $loan->payment_schedules()
                    ->whereIn('status', ['pending', 'overdue'])
                    ->where('id', '!=', $schedule->id)
                    ->orderBy('due_date')
                    ->get();

                $history->amount_paid -= $excess;
                $history->save();

                foreach ($nextSchedules as $next) {
                    if ($excess < 0.001) break;

                    $nextTotalDue  = $this->scheduleTotalDue($next);
                    $nextApproved  = (float) PaymentHistory::where('payment_schedule_id', $next->id)
                        ->where('status', 'approved')
                        ->sum('amount_paid');
                    $nextStillOwed = max(0, $nextTotalDue - $nextApproved);

                    if ($nextStillOwed < 0.001) {
                        $next->update(['status' => 'paid']);
                        continue;
                    }

                    if ($excess >= $nextStillOwed) {
                        PaymentHistory::create([
                            'payment_schedule_id' => $next->id,
                            'amount_paid'         => round($nextStillOwed, 2),
                            'payment_method'      => $history->payment_method,
                            'payment_date'        => $history->payment_date,
                            'reference_number'    => $history->reference_number,
                            'receipt_number'      => null,
                            'status'              => 'approved',
                        ]);
                        $next->update(['status' => 'paid']);
                        $excess -= $nextStillOwed;
                    } else {
                        PaymentHistory::create([
                            'payment_schedule_id' => $next->id,
                            'amount_paid'         => round($excess, 2),
                            'payment_method'      => $history->payment_method,
                            'payment_date'        => $history->payment_date,
                            'reference_number'    => $history->reference_number,
                            'receipt_number'      => null,
                            'status'              => 'approved',
                        ]);
                        $excess = 0;
                        break;
                    }
                }
            }

            $allPaid = $loan->payment_schedules()
                ->whereNotIn('status', ['paid', 'cancelled'])
                ->doesntExist();

            if ($allPaid) {
                $loan->update(['status' => 'completed']);
            }
        });

        return back()->with('success', 'Payment approved. Overpayment cascaded to next schedules.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reject Payment
    // ─────────────────────────────────────────────────────────────────────────
    public function rejectPayment(Request $request, $historyId)
    {
        $history = PaymentHistory::findOrFail($historyId);
        abort_if($history->status !== 'for_approval', 422, 'Payment is not pending approval.');

        $validated = $request->validate(['remarks' => 'nullable|string|max:500']);
        $history->update([
            'status' => 'rejected',
            'remarks' => $validated['remarks']
        ]);

        return back()->with('success', 'Payment rejected.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Add / Update Penalty
    // ─────────────────────────────────────────────────────────────────────────
    public function addPenalty(Request $request, $scheduleId)
    {
        $schedule = PaymentSchedule::findOrFail($scheduleId);
        abort_if($schedule->status === 'paid', 422, 'Cannot modify a paid schedule.');

        $validated = $request->validate([
            'penalty_amount' => 'required|numeric|min:0',
            'remarks'        => 'nullable|string|max:500',
        ]);

        $schedule->update(['penalty_amount' => $validated['penalty_amount']]);

        return back()->with('success', 'Penalty saved.');
    }

    public function updatePenalty(Request $request, $scheduleId)
    {
        return $this->addPenalty($request, $scheduleId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Add / Update Rebate
    // ─────────────────────────────────────────────────────────────────────────
    public function addRebate(Request $request, $scheduleId)
    {
        $schedule = PaymentSchedule::findOrFail($scheduleId);
        abort_if($schedule->status === 'paid', 422, 'Cannot modify a paid schedule.');

        $validated = $request->validate([
            'rebate_amount'  => 'required|numeric|min:0',
            'rebate_remarks' => 'nullable|string|max:500',
        ]);

        $schedule->update([
            'rebate_amount'  => $validated['rebate_amount'],
            'rebate_remarks' => $validated['rebate_remarks'] ?? null,
        ]);

        // Re-evaluate if schedule is now fully paid after rebate
        $totalApproved = (float) $schedule->payment_histories()->where('status', 'approved')->sum('amount_paid');
        $totalDue      = $this->scheduleTotalDue($schedule->fresh());

        if ($totalApproved >= $totalDue && $totalDue > 0) {
            $schedule->update(['status' => 'paid']);

            $loan    = $schedule->loan;
            $allPaid = $loan->payment_schedules()->whereNotIn('status', ['paid', 'cancelled'])->doesntExist();
            if ($allPaid) $loan->update(['status' => 'completed']);
        }

        return back()->with('success', 'Rebate saved.');
    }

    public function updateRebate(Request $request, $scheduleId)
    {
        return $this->addRebate($request, $scheduleId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────────────────
    private function scheduleTotalDue(PaymentSchedule $s): float
    {
        return (float)$s->amount_due
            + (float)($s->penalty_amount ?? 0)
            - (float)($s->rebate_amount  ?? 0);
    }
}
