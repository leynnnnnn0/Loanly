<?php

namespace App\Services\Reports;

use App\Models\Borrower;
use App\Models\Loan;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function data(): array
    {
        return [
            'stats' => $this->stats(),
            'loansByStatus' => $this->loansByStatus(),
            'monthlyLoans' => $this->monthlyLoans(),
            'monthlyCollections' => $this->monthlyCollections(),
            'upcomingDues' => $this->upcomingDues(),
            'recentLoans' => $this->recentLoans(),
        ];
    }

    /**
     * @return array<string, float|int>
     */
    private function stats(): array
    {
        return [
            'total_loans' => Loan::count(),
            'active_loans' => Loan::where('status', 'active')->count(),
            'pending_loans' => Loan::where('status', 'pending')->count(),
            'completed_loans' => Loan::where('status', 'completed')->count(),
            'total_borrowers' => Borrower::count(),
            'active_borrowers' => Borrower::where('account_status', 'active')->count(),
            'total_disbursed' => round((float) Loan::whereIn('status', ['active', 'completed'])->sum('amount'), 2),
            'total_collected' => round((float) PaymentHistory::where('status', 'approved')->sum('amount_paid'), 2),
            'overdue_schedules' => PaymentSchedule::where('status', 'overdue')->count(),
            'pending_payments' => PaymentHistory::where('status', 'for_approval')->count(),
        ];
    }

    private function loansByStatus()
    {
        return Loan::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => ['status' => $row->status, 'count' => $row->count]);
    }

    private function monthlyLoans()
    {
        return Loan::select(
            DB::raw($this->monthExpression('transaction_date').' as month'),
            DB::raw('count(*) as count'),
            DB::raw('sum(amount) as total_amount')
        )
            ->where('transaction_date', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'count' => $row->count,
                'total_amount' => round((float) $row->total_amount, 2),
            ]);
    }

    private function monthlyCollections()
    {
        return PaymentHistory::select(
            DB::raw($this->monthExpression('payment_date').' as month'),
            DB::raw('sum(amount_paid) as total_collected')
        )
            ->where('status', 'approved')
            ->where('payment_date', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'total_collected' => round((float) $row->total_collected, 2),
            ]);
    }

    private function upcomingDues()
    {
        return PaymentSchedule::with(['loan.borrower'])
            ->whereIn('status', ['pending', 'overdue'])
            ->whereBetween('due_date', [now()->toDateString(), now()->addDays(7)->toDateString()])
            ->orderBy('due_date')
            ->limit(10)
            ->get()
            ->map(fn (PaymentSchedule $schedule) => [
                'id' => $schedule->id,
                'due_date' => $schedule->due_date,
                'amount_due' => (float) $schedule->amount_due,
                'status' => $schedule->status,
                'contract_number' => $schedule->loan?->contract_number,
                'borrower_name' => $schedule->loan?->borrower?->full_name,
            ]);
    }

    private function recentLoans()
    {
        return Loan::with('borrower')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'contract_number' => $loan->contract_number,
                'borrower_name' => $loan->borrower?->full_name,
                'amount' => (float) $loan->amount,
                'status' => $loan->status,
                'transaction_date' => $loan->transaction_date,
            ]);
    }

    private function monthExpression(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', {$column})"
            : "DATE_FORMAT({$column}, '%Y-%m')";
    }
}
