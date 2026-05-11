<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->input('from', now()->startOfYear()->toDateString());
        $to   = $request->input('to',   now()->toDateString());

        // ── Disbursed ─────────────────────────────────────────────────────────
        $totalDisbursed = Loan::whereIn('status', ['active', 'completed'])
            ->whereBetween('transaction_date', [$from, $to])
            ->sum('amount');

        $disbursedCount = Loan::whereIn('status', ['active', 'completed'])
            ->whereBetween('transaction_date', [$from, $to])
            ->count();

        // ── Collected ─────────────────────────────────────────────────────────
        $totalCollected = PaymentHistory::where('status', 'approved')
            ->whereBetween('payment_date', [$from, $to])
            ->sum('amount_paid');

        $collectedCount = PaymentHistory::where('status', 'approved')
            ->whereBetween('payment_date', [$from, $to])
            ->count();

        // ── Expected (upcoming schedules within range) ────────────────────────
        $totalExpected = PaymentSchedule::whereIn('status', ['pending', 'overdue'])
            ->whereBetween('due_date', [$from, $to])
            ->sum('amount_due');

        $expectedCount = PaymentSchedule::whereIn('status', ['pending', 'overdue'])
            ->whereBetween('due_date', [$from, $to])
            ->count();

        // ── Overdue ───────────────────────────────────────────────────────────
        $totalOverdue = PaymentSchedule::where('status', 'overdue')
            ->where('due_date', '<', now()->toDateString())
            ->sum('amount_due');

        $overdueCount = PaymentSchedule::where('status', 'overdue')
            ->where('due_date', '<', now()->toDateString())
            ->count();

        // ── Daily disbursed vs collected (for chart) ──────────────────────────
        $dailyDisbursed = Loan::select(
            DB::raw('DATE(transaction_date) as day'),
            DB::raw('SUM(amount) as total')
        )
            ->whereIn('status', ['active', 'completed'])
            ->whereBetween('transaction_date', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn($r) => ['day' => $r->day, 'disbursed' => (float) $r->total, 'collected' => 0]);

        $dailyCollected = PaymentHistory::select(
            DB::raw('DATE(payment_date) as day'),
            DB::raw('SUM(amount_paid) as total')
        )
            ->where('status', 'approved')
            ->whereBetween('payment_date', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Merge into one series
        $map = [];
        foreach ($dailyDisbursed as $r) {
            $map[$r['day']] = ['day' => $r['day'], 'disbursed' => $r['disbursed'], 'collected' => 0];
        }
        foreach ($dailyCollected as $r) {
            if (isset($map[$r->day])) $map[$r->day]['collected'] = (float) $r->total;
            else $map[$r->day] = ['day' => $r->day, 'disbursed' => 0, 'collected' => (float) $r->total];
        }
        ksort($map);
        $dailySeries = array_values($map);

        // ── Expected collections timeline ─────────────────────────────────────
        $expectedTimeline = PaymentSchedule::select(
            DB::raw('DATE(due_date) as day'),
            DB::raw('SUM(amount_due) as total'),
            DB::raw('COUNT(*) as count')
        )
            ->whereIn('status', ['pending', 'overdue'])
            ->whereBetween('due_date', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn($r) => [
                'day'   => $r->day,
                'total' => (float) $r->total,
                'count' => $r->count,
            ]);

        // ── Overdue breakdown by age ──────────────────────────────────────────
        $overdueBreakdown = PaymentSchedule::select(
            DB::raw('DATEDIFF(CURDATE(), due_date) as days_overdue'),
            DB::raw('SUM(amount_due) as total'),
            DB::raw('COUNT(*) as count')
        )
            ->where('status', 'overdue')
            ->where('due_date', '<', now()->toDateString())
            ->groupBy('days_overdue')
            ->orderBy('days_overdue')
            ->get()
            ->groupBy(fn($r) => match (true) {
                $r->days_overdue <= 7   => '1–7 days',
                $r->days_overdue <= 30  => '8–30 days',
                $r->days_overdue <= 90  => '31–90 days',
                default                  => '90+ days',
            })
            ->map(fn($group, $label) => [
                'label' => $label,
                'total' => round($group->sum('total'), 2),
                'count' => $group->sum('count'),
            ])
            ->values();

        // ── Overdue borrowers list ────────────────────────────────────────────
        $overdueLoans = PaymentSchedule::with(['loan.borrower'])
            ->where('status', 'overdue')
            ->where('due_date', '<', now()->toDateString())
            ->orderBy('due_date')
            ->limit(15)
            ->get()
            ->map(fn($s) => [
                'id'              => $s->id,
                'due_date'        => $s->due_date,
                'amount_due'      => (float) $s->amount_due,
                'days_overdue'    => now()->diffInDays($s->due_date),
                'contract_number' => $s->loan?->contract_number,
                'borrower_name'   => $s->loan?->borrower?->full_name,
            ]);

        return Inertia::render('Admin/Sales/Index', [
            'filters' => ['from' => $from, 'to' => $to],
            'kpis' => [
                'total_disbursed'  => round($totalDisbursed, 2),
                'disbursed_count'  => $disbursedCount,
                'total_collected'  => round($totalCollected, 2),
                'collected_count'  => $collectedCount,
                'total_expected'   => round($totalExpected, 2),
                'expected_count'   => $expectedCount,
                'total_overdue'    => round($totalOverdue, 2),
                'overdue_count'    => $overdueCount,
            ],
            'dailySeries'       => $dailySeries,
            'expectedTimeline'  => $expectedTimeline,
            'overdueBreakdown'  => $overdueBreakdown,
            'overdueLoans'      => $overdueLoans,
        ]);
    }
}
