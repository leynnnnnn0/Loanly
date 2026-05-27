<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Models\Loan;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {

        $totalLoans = Loan::count();
        $activeLoans = Loan::where('status', 'active')->count();
        $pendingLoans = Loan::where('status', 'pending')->count();
        $completedLoans = Loan::where('status', 'completed')->count();
        $totalBorrowers = Borrower::count();
        $activeBorrowers = Borrower::where('account_status', 'active')->count();

        $totalDisbursed = Loan::whereIn('status', ['active', 'completed'])->sum('amount');

        $totalCollected = PaymentHistory::where('status', 'approved')->sum('amount_paid');

        $overdueSchedules = PaymentSchedule::where('status', 'overdue')->count();

        $pendingPayments = PaymentHistory::where('status', 'for_approval')->count();

        $loansByStatus = Loan::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => ['status' => $row->status, 'count' => $row->count]);

        $monthlyLoans = Loan::select(
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
                'total_amount' => round($row->total_amount, 2),
            ]);

        $monthlyCollections = PaymentHistory::select(
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
                'total_collected' => round($row->total_collected, 2),
            ]);

        $upcomingDues = PaymentSchedule::with(['loan.borrower'])
            ->whereIn('status', ['pending', 'overdue'])
            ->whereBetween('due_date', [now()->toDateString(), now()->addDays(7)->toDateString()])
            ->orderBy('due_date')
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'due_date' => $s->due_date,
                'amount_due' => (float) $s->amount_due,
                'status' => $s->status,
                'contract_number' => $s->loan?->contract_number,
                'borrower_name' => $s->loan?->borrower?->full_name,
            ]);

        $recentLoans = Loan::with('borrower')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'contract_number' => $l->contract_number,
                'borrower_name' => $l->borrower?->full_name,
                'amount' => (float) $l->amount,
                'status' => $l->status,
                'transaction_date' => $l->transaction_date,
            ]);

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => [
                'total_loans' => $totalLoans,
                'active_loans' => $activeLoans,
                'pending_loans' => $pendingLoans,
                'completed_loans' => $completedLoans,
                'total_borrowers' => $totalBorrowers,
                'active_borrowers' => $activeBorrowers,
                'total_disbursed' => round($totalDisbursed, 2),
                'total_collected' => round($totalCollected, 2),
                'overdue_schedules' => $overdueSchedules,
                'pending_payments' => $pendingPayments,
            ],
            'loansByStatus' => $loansByStatus,
            'monthlyLoans' => $monthlyLoans,
            'monthlyCollections' => $monthlyCollections,
            'upcomingDues' => $upcomingDues,
            'recentLoans' => $recentLoans,
        ]);
    }

    private function monthExpression(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', {$column})"
            : "DATE_FORMAT({$column}, '%Y-%m')";
    }
}
