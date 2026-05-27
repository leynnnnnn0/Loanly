<?php

namespace App\Services;

use App\Models\Borrower;

class CreditScoreService
{
    /*
    |--------------------------------------------------------------------------
    | Score Weights  (must sum to 100)
    |--------------------------------------------------------------------------
    | PAYMENT_HISTORY   – rewards consistent on-time payments
    | OUTSTANDING_DEBT  – penalises overdue / unpaid balances
    | LOAN_UTILIZATION  – compares borrowed amount vs approved limit
    | LOAN_HISTORY      – rewards completed / long-standing loans
    */
    private const WEIGHT_PAYMENT_HISTORY = 40;

    private const WEIGHT_OUTSTANDING_DEBT = 25;

    private const WEIGHT_LOAN_UTILIZATION = 20;

    private const WEIGHT_LOAN_HISTORY = 15;

    /*
    |--------------------------------------------------------------------------
    | Score Bands
    |--------------------------------------------------------------------------
    */
    public const BAND_EXCELLENT = 'Excellent';  // 850 – 1 000

    public const BAND_GOOD = 'Good';        // 700 – 849

    public const BAND_FAIR = 'Fair';        // 550 – 699

    public const BAND_POOR = 'Poor';        // 400 – 549

    public const BAND_VERY_POOR = 'Very Poor';   // 300 – 399

    // -------------------------------------------------------------------------

    /**
     * Compute and return the full credit-score breakdown for a borrower.
     *
     * @return array{
     *   score: int,
     *   band: string,
     *   breakdown: array{
     *     payment_history:  array{score: float, weight: int, weighted: float},
     *     outstanding_debt: array{score: float, weight: int, weighted: float},
     *     loan_utilization: array{score: float, weight: int, weighted: float},
     *     loan_history:     array{score: float, weight: int, weighted: float},
     *   },
     *   meta: array{
     *     total_loans: int,
     *     completed_loans: int,
     *     active_loans: int,
     *     total_schedules: int,
     *     on_time_payments: int,
     *     late_payments: int,
     *     missed_payments: int,
     *     total_amount_due: float,
     *     total_amount_paid: float,
     *     overdue_amount: float,
     *   }
     * }
     */
    public function compute(Borrower $borrower): array
    {
        // Eager-load everything we need in one query
        $borrower->loadMissing([
            'loans.payment_schedules.payment_histories',
        ]);

        $loans = $borrower->loans->whereIn('status', ['active, completed']);

        // ── Raw metrics ──────────────────────────────────────────────────────
        $meta = $this->gatherMeta($loans);

        // ── Component scores (0 – 100 each) ──────────────────────────────────
        $paymentHistoryScore = $this->scorePaymentHistory($meta);
        $outstandingDebtScore = $this->scoreOutstandingDebt($meta);
        $loanUtilizationScore = $this->scoreLoanUtilization($meta, $loans);
        $loanHistoryScore = $this->scoreLoanHistory($meta);

        // ── Weighted composite → scale to 300-1000 ───────────────────────────
        $weighted =
            ($paymentHistoryScore * self::WEIGHT_PAYMENT_HISTORY / 100) +
            ($outstandingDebtScore * self::WEIGHT_OUTSTANDING_DEBT / 100) +
            ($loanUtilizationScore * self::WEIGHT_LOAN_UTILIZATION / 100) +
            ($loanHistoryScore * self::WEIGHT_LOAN_HISTORY / 100);

        // Scale 0–100 → 300–1000
        $score = (int) round(300 + ($weighted / 100) * 700);
        $score = max(300, min(1000, $score));

        return [
            'score' => $score,
            'band' => $this->band($score),
            'breakdown' => [
                'payment_history' => [
                    'score' => round($paymentHistoryScore, 2),
                    'weight' => self::WEIGHT_PAYMENT_HISTORY,
                    'weighted' => round($paymentHistoryScore * self::WEIGHT_PAYMENT_HISTORY / 100, 2),
                ],
                'outstanding_debt' => [
                    'score' => round($outstandingDebtScore, 2),
                    'weight' => self::WEIGHT_OUTSTANDING_DEBT,
                    'weighted' => round($outstandingDebtScore * self::WEIGHT_OUTSTANDING_DEBT / 100, 2),
                ],
                'loan_utilization' => [
                    'score' => round($loanUtilizationScore, 2),
                    'weight' => self::WEIGHT_LOAN_UTILIZATION,
                    'weighted' => round($loanUtilizationScore * self::WEIGHT_LOAN_UTILIZATION / 100, 2),
                ],
                'loan_history' => [
                    'score' => round($loanHistoryScore, 2),
                    'weight' => self::WEIGHT_LOAN_HISTORY,
                    'weighted' => round($loanHistoryScore * self::WEIGHT_LOAN_HISTORY / 100, 2),
                ],
            ],
            'meta' => $meta,
        ];
    }

    // ─── Meta collector ───────────────────────────────────────────────────────

    private function gatherMeta($loans): array
    {
        $totalSchedules = 0;
        $onTimePayments = 0;
        $latePayments = 0;
        $missedPayments = 0;
        $totalAmountDue = 0.0;
        $totalAmountPaid = 0.0;
        $overdueAmount = 0.0;
        $completedLoans = 0;
        $activeLoans = 0;

        foreach ($loans as $loan) {
            if (strtolower($loan->status ?? '') === 'completed') {
                $completedLoans++;
            } elseif (! $loan->is_voided) {
                $activeLoans++;
            }

            foreach ($loan->payment_schedules as $schedule) {
                $totalSchedules++;

                $due = $schedule->amount_due + $schedule->penalty_amount - $schedule->rebate_amount;
                $paidForSchedule = $schedule->payment_histories->sum('amount_paid');

                $totalAmountDue += $due;
                $totalAmountPaid += $paidForSchedule;

                $status = strtolower($schedule->status ?? '');

                if ($status === 'paid') {
                    $wasLate = $schedule->payment_histories->contains(
                        fn ($ph) => $ph->payment_date > $schedule->due_date
                    );
                    $wasLate ? $latePayments++ : $onTimePayments++;
                } elseif (in_array($status, ['overdue', 'missed'])) {
                    $missedPayments++;
                    $overdueAmount += max(0, $due - $paidForSchedule);
                } elseif ($status === 'partial') {
                    $latePayments++;
                    $overdueAmount += max(0, $due - $paidForSchedule);
                }
            }
        }

        return [
            'total_loans' => $loans->count(),
            'completed_loans' => $completedLoans,
            'active_loans' => $activeLoans,
            'total_schedules' => $totalSchedules,
            'on_time_payments' => $onTimePayments,
            'late_payments' => $latePayments,
            'missed_payments' => $missedPayments,
            'total_amount_due' => $totalAmountDue,
            'total_amount_paid' => $totalAmountPaid,
            'overdue_amount' => $overdueAmount,
        ];
    }

    // ─── Component scorers (each returns 0 – 100) ────────────────────────────

    /**
     * 40 % — Rewards on-time, penalises late (50 %) and missed (0 %).
     */
    private function scorePaymentHistory(array $meta): float
    {
        $total = $meta['total_schedules'];

        if ($total === 0) {
            return 50.0; // Neutral for borrowers with no history yet
        }

        $score = (
            ($meta['on_time_payments'] * 1.0) +
            ($meta['late_payments'] * 0.5) +
            ($meta['missed_payments'] * 0.0)
        ) / $total * 100;

        return min(100.0, max(0.0, $score));
    }

    /**
     * 25 % — Low overdue balance relative to total due = high score.
     */
    private function scoreOutstandingDebt(array $meta): float
    {
        if ($meta['total_amount_due'] <= 0) {
            return 100.0;
        }

        $overdueRatio = $meta['overdue_amount'] / $meta['total_amount_due'];

        // Quadratic penalty: 0 % overdue → 100 pts, 100 % overdue → 0 pts
        $score = (1 - min(1, $overdueRatio)) ** 2 * 100;

        return min(100.0, max(0.0, $score));
    }

    /**
     * 20 % — How much of the approved limit is being used (lower = better).
     */
    private function scoreLoanUtilization(array $meta, $loans): float
    {
        $totalMaxAmount = $loans->sum('max_amount_to_borrow');

        if ($totalMaxAmount <= 0) {
            return 75.0; // Neutral when no limit is configured
        }

        $utilizationRatio = $meta['total_amount_due'] / $totalMaxAmount;

        if ($utilizationRatio <= 0.30) {
            return 100.0;
        } elseif ($utilizationRatio <= 0.70) {
            return 100 - (($utilizationRatio - 0.30) / 0.40) * 40;
        } else {
            return max(0.0, 60 - (($utilizationRatio - 0.70) / 0.30) * 60);
        }
    }

    /**
     * 15 % — More completed loans = higher score; volume bonus up to 10 loans.
     */
    private function scoreLoanHistory(array $meta): float
    {
        if ($meta['total_loans'] === 0) {
            return 50.0;
        }

        // Completion ratio contributes 60 pts max
        $completionRatio = $meta['completed_loans'] / $meta['total_loans'];
        $completionScore = $completionRatio * 60;

        // Volume bonus: up to 40 pts for >= 10 completed loans
        $volumeScore = min(40, ($meta['completed_loans'] / 10) * 40);

        return min(100.0, $completionScore + $volumeScore);
    }

    // ─── Band resolver ────────────────────────────────────────────────────────

    private function band(int $score): string
    {
        return match (true) {
            $score >= 850 => self::BAND_EXCELLENT,
            $score >= 700 => self::BAND_GOOD,
            $score >= 550 => self::BAND_FAIR,
            $score >= 400 => self::BAND_POOR,
            default => self::BAND_VERY_POOR,
        };
    }
}
