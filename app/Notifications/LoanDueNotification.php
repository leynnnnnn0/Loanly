<?php

namespace App\Notifications;

use App\Models\PaymentSchedule;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoanDueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public PaymentSchedule $schedule)
    {
        $this->schedule->loadMissing(['loan.borrower']);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $loan = $this->schedule->loan;
        $borrower = $loan->borrower;
        $dueDate = Carbon::parse($this->schedule->due_date)->format('F d, Y');
        $amount = number_format($this->schedule->amount_due, 2);

        $name = $notifiable->full_name
            ?? $borrower->full_name
            ?? $notifiable->first_name
            ?? 'Borrower';

        return (new MailMessage)
            ->view('emails.loan-due', [
                'name' => $name,
                'dueDate' => $dueDate,
                'contractNumber' => $loan->contract_number,
                'amount' => $amount,
                'loanId' => $loan->id,
                'lenderName' => config('app.lender_name', 'Your Lending Company'),
            ])
            ->subject("Payment Reminder – {$loan->contract_number} due on {$dueDate}");
    }

    public function toDatabase(object $notifiable): array
    {
        $loan = $this->schedule->loan;
        $dueDate = Carbon::parse($this->schedule->due_date)->format('F d, Y');

        return [
            'loan_id' => $loan->id,
            'contract_number' => $loan->contract_number,
            'due_date' => $dueDate,
            'amount_due' => $this->schedule->amount_due,
            'message' => "Payment of PHP {$this->schedule->amount_due} is due on {$dueDate} for loan {$loan->contract_number}.",
        ];
    }
}
