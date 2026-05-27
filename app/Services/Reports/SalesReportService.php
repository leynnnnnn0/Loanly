<?php

namespace App\Services\Reports;

use App\Models\Loan;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SalesReportService
{
    /**
     * @return array<string, mixed>
     */
    public function data(string $from, string $to): array
    {
        return [
            'filters' => ['from' => $from, 'to' => $to],
            'kpis' => $this->kpis($from, $to),
            'dailySeries' => $this->dailySeries($from, $to),
            'expectedTimeline' => $this->expectedTimeline($from, $to),
            'overdueBreakdown' => $this->overdueBreakdown(),
            'overdueLoans' => $this->overdueLoans(),
        ];
    }

    /**
     * @return array<string, float|int>
     */
    private function kpis(string $from, string $to): array
    {
        $disbursed = Loan::whereIn('status', ['active', 'completed'])
            ->whereBetween('transaction_date', [$from, $to]);
        $collected = PaymentHistory::where('status', 'approved')
            ->whereBetween('payment_date', [$from, $to]);
        $expected = PaymentSchedule::whereIn('status', ['pending', 'overdue'])
            ->whereBetween('due_date', [$from, $to]);
        $overdue = PaymentSchedule::where('status', 'overdue')
            ->where('due_date', '<', now()->toDateString());

        return [
            'total_disbursed' => round((float) (clone $disbursed)->sum('amount'), 2),
            'disbursed_count' => (clone $disbursed)->count(),
            'total_collected' => round((float) (clone $collected)->sum('amount_paid'), 2),
            'collected_count' => (clone $collected)->count(),
            'total_expected' => round((float) (clone $expected)->sum('amount_due'), 2),
            'expected_count' => (clone $expected)->count(),
            'total_overdue' => round((float) (clone $overdue)->sum('amount_due'), 2),
            'overdue_count' => (clone $overdue)->count(),
        ];
    }

    /**
     * @return array<int, array{day: string, disbursed: float, collected: float}>
     */
    private function dailySeries(string $from, string $to): array
    {
        $map = [];

        $this->dailyDisbursed($from, $to)
            ->each(function (array $row) use (&$map) {
                $map[$row['day']] = $row;
            });

        $this->dailyCollected($from, $to)
            ->each(function ($row) use (&$map) {
                $map[$row->day] ??= ['day' => $row->day, 'disbursed' => 0, 'collected' => 0];
                $map[$row->day]['collected'] = (float) $row->total;
            });

        ksort($map);

        return array_values($map);
    }

    /**
     * @return Collection<int, array{day: string, disbursed: float, collected: float}>
     */
    private function dailyDisbursed(string $from, string $to): Collection
    {
        return Loan::select(
            DB::raw($this->dateExpression('transaction_date').' as day'),
            DB::raw('SUM(amount) as total')
        )
            ->whereIn('status', ['active', 'completed'])
            ->whereBetween('transaction_date', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'day' => $row->day,
                'disbursed' => (float) $row->total,
                'collected' => 0,
            ]);
    }

    private function dailyCollected(string $from, string $to): Collection
    {
        return PaymentHistory::select(
            DB::raw($this->dateExpression('payment_date').' as day'),
            DB::raw('SUM(amount_paid) as total')
        )
            ->where('status', 'approved')
            ->whereBetween('payment_date', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get();
    }

    private function expectedTimeline(string $from, string $to): Collection
    {
        return PaymentSchedule::select(
            DB::raw($this->dateExpression('due_date').' as day'),
            DB::raw('SUM(amount_due) as total'),
            DB::raw('COUNT(*) as count')
        )
            ->whereIn('status', ['pending', 'overdue'])
            ->whereBetween('due_date', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'day' => $row->day,
                'total' => (float) $row->total,
                'count' => $row->count,
            ]);
    }

    private function overdueBreakdown(): Collection
    {
        return PaymentSchedule::query()
            ->where('status', 'overdue')
            ->where('due_date', '<', now()->toDateString())
            ->get()
            ->groupBy(fn (PaymentSchedule $schedule) => $this->overdueBucket($schedule))
            ->map(fn (Collection $group, string $label) => [
                'label' => $label,
                'total' => round((float) $group->sum('amount_due'), 2),
                'count' => $group->count(),
            ])
            ->values();
    }

    private function overdueLoans(): Collection
    {
        return PaymentSchedule::with(['loan.borrower'])
            ->where('status', 'overdue')
            ->where('due_date', '<', now()->toDateString())
            ->orderBy('due_date')
            ->limit(15)
            ->get()
            ->map(fn (PaymentSchedule $schedule) => [
                'id' => $schedule->id,
                'due_date' => $schedule->due_date,
                'amount_due' => (float) $schedule->amount_due,
                'days_overdue' => now()->diffInDays($schedule->due_date),
                'contract_number' => $schedule->loan?->contract_number,
                'borrower_name' => $schedule->loan?->borrower?->full_name,
            ]);
    }

    private function overdueBucket(PaymentSchedule $schedule): string
    {
        $daysOverdue = now()->diffInDays($schedule->due_date);

        return match (true) {
            $daysOverdue <= 7 => '1-7 days',
            $daysOverdue <= 30 => '8-30 days',
            $daysOverdue <= 90 => '31-90 days',
            default => '90+ days',
        };
    }

    private function dateExpression(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "date({$column})"
            : "DATE({$column})";
    }
}
