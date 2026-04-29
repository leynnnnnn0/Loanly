<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user()->load('borrower');
        $borrower = $user->borrower;
        $isVerified = $borrower && $borrower->account_status === 'verified';

        $loans = collect();
        $summaries = [
            'total_loan_amount'    => 0,
            'this_month_due'       => 0,
            'total_remaining'      => 0,
        ];

        if ($borrower) {
            $loans = $borrower->loans()
                ->with(['payment_schedules' => function ($q) {
                    $q->orderBy('due_date');
                }])
                ->where('is_voided', false)
                ->whereIn('status', ['active', 'completed'])
                ->latest()
                ->take(3)
                ->get()
                ->map(function ($loan) {
                    $totalPaid = $loan->payment_schedules
                        ->where('status', 'paid')
                        ->sum('amount_due');

                    $remaining = $loan->amount - $totalPaid;

                    $nextSchedule = $loan->payment_schedules
                        ->where('status', 'pending')
                        ->sortBy('due_date')
                        ->first();

                    return [
                        'id'             => $loan->id,
                        'contract_number' => $loan->contract_number,
                        'amount'         => (float) $loan->amount,
                        'remaining'      => max(0, (float) $remaining),
                        'terms'          => $loan->loan_duration,
                        'duration_unit'  => $loan->duration_unit,
                        'monthly_due'    => $nextSchedule ? (float) $nextSchedule->amount_due : 0,
                        'status'         => $loan->status,
                        'next_due_date'  => $nextSchedule?->due_date,
                        'variant'        => $loan->id % 2 === 0 ? 'secondary' : 'primary',
                    ];
                });

            $allActiveLoans = $borrower->loans()
                ->where('is_voided', false)
                ->where('status', 'active')
                ->with('payment_schedules')
                ->get();

            $summaries['total_loan_amount'] = $borrower->loans()
                ->where('is_voided', false)
                ->whereIn('status', ['active', 'completed'])
                ->sum('amount');

            $summaries['this_month_due'] = $borrower->loans()
                ->where('is_voided', false)
                ->where('loans.status', 'active')
                ->join('payment_schedules', 'loans.id', '=', 'payment_schedules.loan_id')
                ->whereMonth('payment_schedules.due_date', now()->month)
                ->whereYear('payment_schedules.due_date', now()->year)
                ->where('payment_schedules.status', 'pending')
                ->sum('payment_schedules.amount_due');

            foreach ($allActiveLoans as $loan) {
                $paid = $loan->payment_schedules->where('status', 'paid')->sum('amount_due');
                $summaries['total_remaining'] += max(0, $loan->amount - $paid);
            }
        }

        return Inertia::render('User/Dashboard/Index', [
            'borrower'    => $borrower,
            'isVerified'  => $isVerified,
            'loans'       => $loans,
            'summaries'   => $summaries,
            'activeCount' => $borrower
                ? $borrower->loans()->where('status', 'active')->where('is_voided', false)->count()
                : 0,
        ]);
    }
}
