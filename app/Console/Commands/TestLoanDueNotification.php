<?php

namespace App\Console\Commands;

use App\Models\Loan;
use App\Models\PaymentSchedule;
use App\Notifications\LoanDueNotification;
use Illuminate\Console\Command;

class TestLoanDueNotification extends Command
{
    /**
     * Send a real notification right now for any schedule, bypassing the due-date check.
     *
     * Usage:
     *   php artisan loans:test-due-notification                     → uses first pending schedule found
     *   php artisan loans:test-due-notification --loan=13           → first pending schedule of loan #13
     *   php artisan loans:test-due-notification --schedule=42       → specific schedule
     *   php artisan loans:test-due-notification --email=you@me.com  → override recipient email
     */
    protected $signature = 'loans:test-due-notification
                            {--loan=      : Loan ID to test with}
                            {--schedule=  : Specific PaymentSchedule ID}
                            {--email=     : Override the recipient email}';

    protected $description = 'Send a test loan due notification immediately (bypasses date check)';

    public function handle(): void
    {
        // ── Resolve the schedule ──────────────────────────────────────────────
        if ($scheduleId = $this->option('schedule')) {
            $schedule = PaymentSchedule::with(['loan.borrower.user'])->find($scheduleId);

            if (!$schedule) {
                $this->error("PaymentSchedule #{$scheduleId} not found.");
                return;
            }
        } elseif ($loanId = $this->option('loan')) {
            $loan = Loan::with(['borrower.user', 'payment_schedules'])->find($loanId);

            if (!$loan) {
                $this->error("Loan #{$loanId} not found.");
                return;
            }

            $schedule = $loan->payment_schedules()
                ->whereIn('status', ['pending', 'overdue'])
                ->orderBy('due_date')
                ->first();

            if (!$schedule) {
                $this->error("No pending/overdue schedules found for Loan #{$loanId}.");
                return;
            }

            $schedule->load('loan.borrower.user');
        } else {
            // Fall back to the very first pending schedule in the system
            $schedule = PaymentSchedule::with(['loan.borrower.user'])
                ->whereIn('status', ['pending', 'overdue'])
                ->orderBy('due_date')
                ->first();

            if (!$schedule) {
                $this->error('No pending/overdue schedules found in the system.');
                return;
            }
        }

        // ── Resolve the notifiable user ───────────────────────────────────────
        $user = $schedule->loan?->borrower?->user;

        if (!$user) {
            $this->error("No user found for schedule #{$schedule->id}.");
            return;
        }

        // ── Optional email override ───────────────────────────────────────────
        $originalEmail = $user->email;

        if ($overrideEmail = $this->option('email')) {
            // Temporarily swap the email on the model (not saved to DB)
            $user->email = $overrideEmail;
            $this->warn("Email overridden: {$originalEmail} → {$overrideEmail}");
        }

        // ── Display what we're about to send ─────────────────────────────────
        $this->table(
            ['Field', 'Value'],
            [
                ['Schedule ID',      $schedule->id],
                ['Loan',             $schedule->loan->contract_number],
                ['Borrower',         $schedule->loan->borrower->full_name],
                ['Recipient Email',  $user->email],
                ['Due Date',         $schedule->due_date],
                ['Amount Due',       'PHP ' . number_format($schedule->amount_due, 2)],
                ['Schedule Status',  $schedule->status],
            ]
        );

        if (!$this->confirm('Send this test notification now?', true)) {
            $this->line('Aborted.');
            return;
        }

        // ── Fire the notification ─────────────────────────────────────────────
        $user->notify(new LoanDueNotification($schedule));

        $this->info("✓ Notification sent to {$user->email}.");
        $this->line('Check your inbox (and the <notifications> table if using the database channel).');
    }
}
