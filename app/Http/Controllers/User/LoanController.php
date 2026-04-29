<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\PaymentAttachment;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use Carbon\Carbon;

class LoanController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // Index
    // ─────────────────────────────────────────────────────────────────────────
    public function index()
    {
        $user       = Auth::user()->load('borrower');
        $borrower   = $user->borrower;
        $isVerified = $borrower && $borrower->account_status === 'verified';

        $loans     = collect();
        $summaries = ['total_loaned' => 0, 'total_remaining' => 0, 'total_paid' => 0];

        if ($borrower) {
            $loanModels = $borrower->loans()
                ->where('is_voided', false)
                ->with('payment_schedules.payment_histories')
                ->latest()
                ->get();

            $loans = $loanModels->map(function ($loan) {
                // Only approved payments count
                $totalApproved = $loan->payment_schedules->sum(fn($s) =>
                $s->payment_histories->where('status', 'approved')->sum('amount_paid'));

                $totalPayable = $loan->payment_schedules->sum(fn($s) =>
                $s->amount_due + ($s->penalty_amount ?? 0) - ($s->rebate_amount ?? 0));

                $remaining    = max(0, $totalPayable - $totalApproved);

                $nextSchedule = $loan->payment_schedules
                    ->where('status', 'pending')
                    ->sortBy('due_date')
                    ->first();

                return [
                    'id'               => $loan->id,
                    'contract_number'  => $loan->contract_number,
                    'amount'           => (float) $loan->amount,
                    'total_payable'    => (float) $totalPayable,
                    'remaining'        => (float) $remaining,
                    'paid'             => (float) $totalApproved,
                    'terms'            => $loan->loan_duration,
                    'duration_unit'    => $loan->duration_unit,
                    'payment_frequency' => $loan->payment_frequency,
                    'monthly_due'      => $nextSchedule ? (float) $nextSchedule->amount_due : 0,
                    'status'           => $loan->status,
                    'next_due_date'    => $nextSchedule?->due_date,
                    'transaction_date' => $loan->transaction_date,
                    'variant'          => $loan->id % 2 === 0 ? 'secondary' : 'primary',
                ];
            });

            $summaries['total_loaned']    = $loanModels->whereIn('status', ['active', 'completed'])->sum('amount');
            $summaries['total_paid']      = $loanModels->sum(fn($l) =>
            $l->payment_schedules->sum(fn($s) =>
            $s->payment_histories->where('status', 'approved')->sum('amount_paid')));
            $summaries['total_remaining'] = $loanModels->whereIn('status', ['active', 'completed'])->sum(fn($l) =>
            max(
                0,
                $l->payment_schedules->sum(fn($s) => $s->amount_due + ($s->penalty_amount ?? 0) - ($s->rebate_amount ?? 0))
                    - $l->payment_schedules->sum(fn($s) => $s->payment_histories->where('status', 'approved')->sum('amount_paid'))
            ));
        }

        return Inertia::render('User/Loan/Index', [
            'borrower'   => $borrower,
            'isVerified' => $isVerified,
            'loans'      => $loans,
            'summaries'  => $summaries,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Create
    // ─────────────────────────────────────────────────────────────────────────
    public function create()
    {
        $user     = Auth::user()->load('borrower');
        $borrower = $user->borrower;

        abort_if(!$borrower || $borrower->account_status !== 'verified', 403);

        $activeLoansTotal = $borrower->loans()
            ->where('is_voided', false)
            ->whereIn('status', ['active', 'pending'])
            ->sum('amount');

        $maxBorrow         = $borrower->loans()->latest()->value('max_amount_to_borrow') ?? 20000;
        $availableToBorrow = max(0, $maxBorrow - $activeLoansTotal);

        return Inertia::render('User/Loan/Create', [
            'borrower'          => $borrower,
            'maxBorrow'         => (float) $maxBorrow,
            'availableToBorrow' => (float) $availableToBorrow,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Store
    // ─────────────────────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $user     = Auth::user()->load('borrower');
        $borrower = $user->borrower;

        abort_if(!$borrower || $borrower->account_status !== 'verified', 403);

        $validated = $request->validate([
            'amount'            => 'required|numeric|min:1000',
            'loan_duration'     => 'required|integer|min:1|max:3',
            'transaction_date'  => 'required|date',
            'reason'            => 'required|string|max:500',
            'payment_frequency' => 'required|in:monthly,weekly',
        ]);

        // Business rules enforced server-side
        $validated['interest_type']   = 'percentage';
        $validated['interest_value']  = 2;
        $validated['interest_period'] = 'monthly';
        $validated['duration_unit']   = 'months';

        $maxBorrow   = $borrower->loans()->latest()->value('max_amount_to_borrow') ?? 20000;
        $activeTotal = $borrower->loans()
            ->where('is_voided', false)
            ->whereIn('status', ['active', 'pending'])
            ->sum('amount');

        if (($activeTotal + $validated['amount']) > $maxBorrow) {
            return back()->withErrors(['amount' => 'This amount exceeds your borrowing limit.']);
        }

        DB::transaction(function () use ($validated, $borrower) {
            $latest         = Loan::latest('id')->lockForUpdate()->first();
            $nextId         = $latest ? $latest->id + 1 : 1;
            $contractNumber = 'LCN-' . str_pad($nextId, 8, '0', STR_PAD_LEFT);

            $loan = Loan::create([
                'contract_number'   => $contractNumber,
                'borrower_id'       => $borrower->id,
                'amount'            => $validated['amount'],
                'interest_type'     => $validated['interest_type'],
                'interest_value'    => $validated['interest_value'],
                'interest_period'   => $validated['interest_period'],
                'loan_duration'     => $validated['loan_duration'],
                'duration_unit'     => $validated['duration_unit'],
                'transaction_date'  => $validated['transaction_date'],
                'reason'            => $validated['reason'],
                'payment_frequency' => $validated['payment_frequency'],
                'status'            => 'pending',
            ]);

            foreach ($this->generateSchedules($loan) as $schedule) {
                PaymentSchedule::create([
                    'loan_id'    => $loan->id,
                    'amount_due' => $schedule['amount_due'],
                    'due_date'   => $schedule['due_date'],
                    'status'     => 'pending',
                ]);
            }
        });

        return redirect()->to('/user/my-loans')
            ->with('success', 'Loan application submitted successfully!');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Show
    // ─────────────────────────────────────────────────────────────────────────
    public function show($id)
    {
        $user     = Auth::user()->load('borrower');
        $borrower = $user->borrower;

        $loan = Loan::where('borrower_id', $borrower->id)
            ->with(['payment_schedules.payment_histories.attachments'])
            ->findOrFail($id);

        // Compute from approved payments only
        $totalApproved = $loan->payment_schedules->sum(fn($s) =>
        $s->payment_histories->where('status', 'approved')->sum('amount_paid'));

        $totalPayable = $loan->payment_schedules->sum(fn($s) =>
        $s->amount_due + ($s->penalty_amount ?? 0) - ($s->rebate_amount ?? 0));

        return Inertia::render('User/Loan/Show', [
            'loan' => array_merge($loan->toArray(), [
                'total_paid' => (float) $totalApproved,
                'remaining'  => (float) max(0, $totalPayable - $totalApproved),
            ]),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Void (user can only cancel pending applications)
    // ─────────────────────────────────────────────────────────────────────────
    public function void(Request $request, $id)
    {
        $user     = Auth::user()->load('borrower');
        $borrower = $user->borrower;

        $loan = Loan::where('borrower_id', $borrower->id)->findOrFail($id);

        abort_if($loan->status !== 'pending' || $loan->is_voided, 403);

        $validated = $request->validate([
            'void_reason' => 'required|string|max:500',
        ]);

        DB::transaction(function () use ($loan, $validated) {
            $loan->update([
                'is_voided'   => true,
                'voided_at'   => now(),
                'void_reason' => $validated['void_reason'],
                'status'      => 'voided',
            ]);

            $loan->payment_schedules()->where('status', 'pending')->update(['status' => 'cancelled']);
        });

        return redirect()->to('/user/my-loans')
            ->with('success', 'Loan application cancelled successfully.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Record Payment (submitted as for_approval — admin must approve)
    //
    // Accepts optional multiple file attachments (images / PDFs).
    // Files are stored in storage/app/public/payment_attachments/{history_id}/
    // and recorded in the payment_attachments table.
    // ─────────────────────────────────────────────────────────────────────────
    public function recordPayment(Request $request, $scheduleId)
    {
        $user     = Auth::user()->load('borrower');
        $borrower = $user->borrower;

        $schedule = PaymentSchedule::with('loan')->findOrFail($scheduleId);

        // Ownership & state checks
        abort_if($schedule->loan->borrower_id !== $borrower->id, 403);
        abort_if($schedule->loan->is_voided, 403);
        abort_if($schedule->loan->status !== 'active', 422, 'Loan is not active.');
        abort_if($schedule->status === 'paid', 422, 'This schedule is already paid.');

        $validated = $request->validate([
            'amount_paid'      => 'required|numeric|min:0.01',
            'payment_method'   => 'required|in:cash,bank_transfer,gcash,paymaya,check',
            'payment_date'     => 'required|date',
            'reference_number' => 'nullable|string|max:100',
            'receipt_number'   => 'nullable|string|max:100',
            // Up to 10 files, each image or PDF, max 5 MB each
            'attachments'      => 'nullable|array|max:10',
            'attachments.*'    => 'file|mimes:jpeg,jpg,png,gif,webp,pdf|max:5120',
        ]);

        DB::transaction(function () use ($validated, $schedule, $request) {
            // 1. Create the payment history record
            $history = PaymentHistory::create([
                'payment_schedule_id' => $schedule->id,
                'amount_paid'         => $validated['amount_paid'],
                'payment_method'      => $validated['payment_method'],
                'payment_date'        => $validated['payment_date'],
                'reference_number'    => $validated['reference_number'] ?? null,
                'receipt_number'      => $validated['receipt_number'] ?? null,
                'status'              => 'for_approval',
            ]);

 
            // 2. Store each uploaded file and create an attachment record
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store(
                        "payment_attachments/{$history->id}",
                        'public'   // stored in storage/app/public — served via /storage/...
                    );

                    PaymentAttachment::create([
                        'payment_history_id' => $history->id,
                        'image_path'         => $path,
                    ]);
                }
            }
        });

        return back()->with('success', 'Payment submitted! It will be reflected once approved by admin.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generate payment schedules.
     *  - Interest: 2% per month, simple
     *  - monthly frequency → loan_duration payments
     *  - weekly  frequency → loan_duration × 4 payments
     */
    private function generateSchedules(Loan $loan): array
    {
        $schedules = [];
        $principal = (float) $loan->amount;
        $months    = (int)   $loan->loan_duration;

        $totalInterest    = $principal * ($loan->interest_value / 100) * $months;
        $terms            = $loan->payment_frequency === 'weekly' ? $months * 4 : $months;
        $principalPerTerm = round($principal     / $terms, 2);
        $interestPerTerm  = round($totalInterest / $terms, 2);
        $amountDue        = round($principalPerTerm + $interestPerTerm, 2);
        $startDate        = Carbon::parse($loan->transaction_date);

        for ($i = 1; $i <= $terms; $i++) {
            $dueDate = $loan->payment_frequency === 'weekly'
                ? $startDate->copy()->addWeeks($i)
                : $startDate->copy()->addMonths($i);

            $schedules[] = [
                'amount_due' => $amountDue,
                'due_date'   => $dueDate->toDateString(),
            ];
        }

        return $schedules;
    }
}
