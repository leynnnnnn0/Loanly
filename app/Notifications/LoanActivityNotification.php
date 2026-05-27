<?php

namespace App\Notifications;

use App\Models\Loan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LoanActivityNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        private readonly string $message,
        private readonly string $description,
        private readonly string $actionUrl,
        private readonly ?Loan $loan = null,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => $this->message,
            'description' => $this->description,
            'action_url' => $this->actionUrl,
            'loan_id' => $this->loan?->id,
            'contract_number' => $this->loan?->contract_number,
            'borrower_name' => $this->loan?->borrower?->full_name,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
