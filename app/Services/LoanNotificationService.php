<?php

namespace App\Services;

use App\Models\Loan;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use App\Models\User;
use App\Notifications\LoanActivityNotification;

class LoanNotificationService
{
    public function loanSubmitted(Loan $loan): void
    {
        $this->notifyAdmins(
            'New loan application',
            "{$loan->borrower?->full_name} submitted loan {$loan->contract_number}.",
            $loan,
        );
    }

    public function loanVoided(Loan $loan): void
    {
        $this->notifyAdmins(
            'Loan application voided',
            "{$loan->borrower?->full_name} voided loan {$loan->contract_number}.",
            $loan,
        );
    }

    public function paymentSubmitted(PaymentHistory $history): void
    {
        $history->loadMissing('payment_schedule.loan.borrower');
        $loan = $history->payment_schedule->loan;

        $this->notifyAdmins(
            'Payment submitted for approval',
            "{$loan->borrower?->full_name} submitted a payment for {$loan->contract_number}.",
            $loan,
        );
    }

    public function loanApproved(Loan $loan): void
    {
        $this->notifyBorrower(
            $loan,
            'Loan approved',
            "Your loan {$loan->contract_number} has been approved.",
        );
    }

    public function loanRejected(Loan $loan): void
    {
        $this->notifyBorrower(
            $loan,
            'Loan rejected',
            "Your loan {$loan->contract_number} was rejected.",
        );
    }

    public function paymentApproved(PaymentHistory $history): void
    {
        $history->loadMissing('payment_schedule.loan.borrower.user');
        $loan = $history->payment_schedule->loan;

        $this->notifyBorrower(
            $loan,
            'Payment approved',
            "Your payment for {$loan->contract_number} has been approved.",
        );
    }

    public function paymentRejected(PaymentHistory $history): void
    {
        $history->loadMissing('payment_schedule.loan.borrower.user');
        $loan = $history->payment_schedule->loan;

        $this->notifyBorrower(
            $loan,
            'Payment rejected',
            "Your payment for {$loan->contract_number} was rejected.",
        );
    }

    public function penaltyUpdated(PaymentSchedule $schedule): void
    {
        $schedule->loadMissing('loan.borrower.user');

        $this->notifyBorrower(
            $schedule->loan,
            'Penalty updated',
            "A penalty was updated on loan {$schedule->loan->contract_number}.",
        );
    }

    public function rebateUpdated(PaymentSchedule $schedule): void
    {
        $schedule->loadMissing('loan.borrower.user');

        $this->notifyBorrower(
            $schedule->loan,
            'Rebate updated',
            "A rebate was updated on loan {$schedule->loan->contract_number}.",
        );
    }

    private function notifyBorrower(Loan $loan, string $message, string $description): void
    {
        $loan->loadMissing('borrower.user');
        $loan->borrower?->user?->notify(new LoanActivityNotification(
            $message,
            $description,
            "/user/my-loans/{$loan->id}",
            $loan,
        ));
    }

    private function notifyAdmins(string $message, string $description, Loan $loan): void
    {
        $loan->loadMissing('borrower');

        User::query()
            ->where('role', 'admin')
            ->get()
            ->each(fn (User $admin) => $admin->notify(new LoanActivityNotification(
                $message,
                $description,
                "/admin/loans/{$loan->id}",
                $loan,
            )));
    }
}
