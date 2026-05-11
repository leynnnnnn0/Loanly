<?php

namespace App\Console\Commands;

use App\Models\PaymentSchedule;
use App\Notifications\LoanDueNotification;
use Illuminate\Console\Command;

class SendLoanDueReminders extends Command
{
    /**
     * Run daily via the scheduler.
     * Notifies borrowers whose payment is due in exactly N days.
     *
     * Usage:
     *   php artisan loans:send-due-reminders            → due in 3 days (default)
     *   php artisan loans:send-due-reminders --days=1   → due tomorrow
     *   php artisan loans:send-due-reminders --days=0   → due today
     *   php artisan loans:send-due-reminders --all      → due in 1, 3, and 7 days (all tiers)
     */
    protected $signature = 'loans:send-due-reminders
                            {--days=3 : Days before due date to send reminder}
                            {--all    : Send all reminder tiers (1, 3, 7 days)}';

    protected $description = 'Send payment due reminders to borrowers';

    public function handle(): void
    {
        $tiers = $this->option('all')
            ? [7, 3, 1]
            : [(int) $this->option('days')];

        foreach ($tiers as $days) {
            $targetDate = now()->addDays($days)->toDateString();

            $schedules = PaymentSchedule::with(['loan.borrower.user'])
                ->whereDate('due_date', $targetDate)
                ->whereIn('status', ['pending', 'overdue'])
                ->get();

            if ($schedules->isEmpty()) {
                $this->info("No schedules due in {$days} day(s). Skipping.");
                continue;
            }

            $count = 0;

            foreach ($schedules as $schedule) {
                $borrower = $schedule->loan?->borrower;
                $user     = $borrower?->user;

                if (!$user) {
                    $this->warn("Schedule #{$schedule->id} has no user — skipped.");
                    continue;
                }

                $user->notify(new LoanDueNotification($schedule));
                $count++;

                $this->line("  ✓ Notified {$user->email} — due {$schedule->due_date}");
            }

            $this->info("Sent {$count} reminder(s) for payments due in {$days} day(s).");
        }
    }
}
