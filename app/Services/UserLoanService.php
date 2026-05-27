<?php

namespace App\Services;

use App\Models\Borrower;
use App\Models\Loan;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserLoanService
{
    public const DEFAULT_MAX_BORROW = 20000;

    private const INTEREST_TYPE = 'percentage';

    private const INTEREST_VALUE = 2;

    private const INTEREST_PERIOD = 'monthly';

    private const DURATION_UNIT = 'months';

    /**
     * @return array{borrower: Borrower|null, isVerified: bool, loans: Collection<int, array<string, mixed>>, summaries: array<string, float|int>}
     */
    public function indexData(?Borrower $borrower): array
    {
        $summaries = ['total_loaned' => 0, 'total_remaining' => 0, 'total_paid' => 0];

        if (! $borrower) {
            return [
                'borrower' => null,
                'isVerified' => false,
                'loans' => collect(),
                'summaries' => $summaries,
            ];
        }

        $loans = $borrower->loans()
            ->with('payment_schedules.payment_histories')
            ->latest()
            ->get();

        return [
            'borrower' => $borrower,
            'isVerified' => $borrower->account_status === 'verified',
            'loans' => $loans->map(fn (Loan $loan) => $this->loanCard($loan)),
            'summaries' => [
                'total_loaned' => (float) $loans->whereIn('status', ['active', 'completed'])->sum('amount'),
                'total_paid' => (float) $loans->sum(fn (Loan $loan) => $this->approvedPayments($loan)),
                'total_remaining' => (float) $loans
                    ->whereIn('status', ['active', 'completed'])
                    ->sum(fn (Loan $loan) => $this->remainingBalance($loan)),
            ],
        ];
    }

    /**
     * @return array{maxBorrow: float, availableToBorrow: float}
     */
    public function borrowingCapacity(Borrower $borrower): array
    {
        $maxBorrow = (float) ($borrower->loans()->latest()->value('max_amount_to_borrow') ?? self::DEFAULT_MAX_BORROW);
        $activeTotal = (float) $borrower->loans()
            ->where('is_voided', false)
            ->whereIn('status', ['active', 'pending'])
            ->sum('amount');

        return [
            'maxBorrow' => $maxBorrow,
            'availableToBorrow' => max(0, $maxBorrow - $activeTotal),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function submitApplication(Borrower $borrower, array $data): Loan
    {
        $capacity = $this->borrowingCapacity($borrower);

        if (((float) $data['amount']) > $capacity['availableToBorrow']) {
            throw ValidationException::withMessages([
                'amount' => 'This amount exceeds your borrowing limit.',
            ]);
        }

        return DB::transaction(function () use ($borrower, $data) {
            $loan = Loan::create([
                ...$this->businessDefaults(),
                'contract_number' => $this->nextContractNumber(),
                'borrower_id' => $borrower->id,
                'amount' => $data['amount'],
                'loan_duration' => $data['loan_duration'],
                'transaction_date' => $data['transaction_date'],
                'reason' => $data['reason'],
                'payment_frequency' => $data['payment_frequency'],
                'status' => 'pending',
            ]);

            $loan->payment_schedules()->createMany($this->generateSchedules($loan));

            return $loan;
        });
    }

    public function findOwnedLoan(Borrower $borrower, int|string $loanId): Loan
    {
        return Loan::where('borrower_id', $borrower->id)
            ->with(['payment_schedules.payment_histories.attachments'])
            ->findOrFail($loanId);
    }

    /**
     * @return array<string, mixed>
     */
    public function showData(Loan $loan): array
    {
        return array_merge($loan->toArray(), [
            'total_paid' => (float) $this->approvedPayments($loan),
            'remaining' => (float) $this->remainingBalance($loan),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function void(Loan $loan, array $data): void
    {
        abort_if($loan->status !== 'pending' || $loan->is_voided, 403);

        DB::transaction(function () use ($loan, $data) {
            $loan->update([
                'is_voided' => true,
                'voided_at' => now(),
                'void_reason' => $data['void_reason'],
                'status' => 'voided',
            ]);

            $loan->payment_schedules()
                ->where('status', 'pending')
                ->update(['status' => 'cancelled']);
        });
    }

    /**
     * @return array{loans: Collection<int, array<string, mixed>>, summaries: array<string, float|int>, activeCount: int}
     */
    public function dashboardData(?Borrower $borrower): array
    {
        $summaries = [
            'total_loan_amount' => 0,
            'this_month_due' => 0,
            'total_remaining' => 0,
        ];

        if (! $borrower) {
            return ['loans' => collect(), 'summaries' => $summaries, 'activeCount' => 0];
        }

        $loans = $borrower->loans()
            ->with(['payment_schedules' => fn ($query) => $query->orderBy('due_date')])
            ->where('is_voided', false)
            ->whereIn('status', ['active', 'completed'])
            ->latest()
            ->take(3)
            ->get();

        $activeLoans = $borrower->loans()
            ->where('is_voided', false)
            ->where('status', 'active')
            ->with('payment_schedules.payment_histories')
            ->get();

        return [
            'loans' => $loans->map(fn (Loan $loan) => $this->dashboardLoanCard($loan)),
            'summaries' => [
                'total_loan_amount' => (float) $borrower->loans()
                    ->where('is_voided', false)
                    ->whereIn('status', ['active', 'completed'])
                    ->sum('amount'),
                'this_month_due' => (float) $this->thisMonthDue($borrower),
                'total_remaining' => (float) $activeLoans->sum(fn (Loan $loan) => $this->remainingBalance($loan)),
            ],
            'activeCount' => $borrower->loans()
                ->where('status', 'active')
                ->where('is_voided', false)
                ->count(),
        ];
    }

    /**
     * @return array<string, string|int|float|null>
     */
    private function loanCard(Loan $loan): array
    {
        $nextSchedule = $loan->payment_schedules
            ->where('status', 'pending')
            ->sortBy('due_date')
            ->first();

        return [
            'id' => $loan->id,
            'contract_number' => $loan->contract_number,
            'amount' => (float) $loan->amount,
            'total_payable' => (float) $this->totalPayable($loan),
            'remaining' => (float) $this->remainingBalance($loan),
            'paid' => (float) $this->approvedPayments($loan),
            'terms' => $loan->loan_duration,
            'duration_unit' => $loan->duration_unit,
            'payment_frequency' => $loan->payment_frequency,
            'monthly_due' => $nextSchedule ? (float) $nextSchedule->amount_due : 0,
            'status' => $loan->status,
            'next_due_date' => $nextSchedule?->due_date,
            'transaction_date' => $loan->transaction_date,
            'variant' => $loan->id % 2 === 0 ? 'secondary' : 'primary',
        ];
    }

    /**
     * @return array<string, string|int|float|null>
     */
    private function dashboardLoanCard(Loan $loan): array
    {
        $nextSchedule = $loan->payment_schedules
            ->where('status', 'pending')
            ->sortBy('due_date')
            ->first();

        return [
            'id' => $loan->id,
            'contract_number' => $loan->contract_number,
            'amount' => (float) $loan->amount,
            'remaining' => (float) $this->remainingBalance($loan),
            'terms' => $loan->loan_duration,
            'duration_unit' => $loan->duration_unit,
            'monthly_due' => $nextSchedule ? (float) $nextSchedule->amount_due : 0,
            'status' => $loan->status,
            'next_due_date' => $nextSchedule?->due_date,
            'variant' => $loan->id % 2 === 0 ? 'secondary' : 'primary',
        ];
    }

    private function totalPayable(Loan $loan): float
    {
        return (float) $loan->payment_schedules->sum(
            fn ($schedule) => $schedule->amount_due
                + ($schedule->penalty_amount ?? 0)
                - ($schedule->rebate_amount ?? 0)
        );
    }

    private function approvedPayments(Loan $loan): float
    {
        return (float) $loan->payment_schedules->sum(
            fn ($schedule) => $schedule->payment_histories
                ->where('status', 'approved')
                ->sum('amount_paid')
        );
    }

    private function remainingBalance(Loan $loan): float
    {
        return max(0, $this->totalPayable($loan) - $this->approvedPayments($loan));
    }

    private function thisMonthDue(Borrower $borrower): float
    {
        return (float) $borrower->loans()
            ->where('is_voided', false)
            ->where('loans.status', 'active')
            ->join('payment_schedules', 'loans.id', '=', 'payment_schedules.loan_id')
            ->whereMonth('payment_schedules.due_date', now()->month)
            ->whereYear('payment_schedules.due_date', now()->year)
            ->where('payment_schedules.status', 'pending')
            ->sum('payment_schedules.amount_due');
    }

    /**
     * @return array<string, string|int>
     */
    private function businessDefaults(): array
    {
        return [
            'interest_type' => self::INTEREST_TYPE,
            'interest_value' => self::INTEREST_VALUE,
            'interest_period' => self::INTEREST_PERIOD,
            'duration_unit' => self::DURATION_UNIT,
        ];
    }

    private function nextContractNumber(): string
    {
        $latest = Loan::latest('id')->lockForUpdate()->first();
        $nextId = $latest ? $latest->id + 1 : 1;

        return 'LCN-'.str_pad((string) $nextId, 8, '0', STR_PAD_LEFT);
    }

    /**
     * @return array<int, array{amount_due: float, due_date: string, status: string}>
     */
    private function generateSchedules(Loan $loan): array
    {
        $principal = (float) $loan->amount;
        $months = (int) $loan->loan_duration;
        $terms = $loan->payment_frequency === 'weekly' ? $months * 4 : $months;
        $totalInterest = $principal * ($loan->interest_value / 100) * $months;
        $amountDue = round(($principal / $terms) + ($totalInterest / $terms), 2);
        $startDate = Carbon::parse($loan->transaction_date);

        return collect(range(1, $terms))
            ->map(fn (int $term) => [
                'amount_due' => $amountDue,
                'due_date' => ($loan->payment_frequency === 'weekly'
                    ? $startDate->copy()->addWeeks($term)
                    : $startDate->copy()->addMonths($term)
                )->toDateString(),
                'status' => 'pending',
            ])
            ->all();
    }
}
