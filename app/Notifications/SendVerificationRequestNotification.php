<?php

namespace App\Notifications;

use App\Mail\SendVerificationMail;
use App\Models\Borrower;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SendVerificationRequestNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(public Borrower $borrower) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): SendVerificationMail
    {
        return new SendVerificationMail($this->borrower)
            ->to($notifiable->email);
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'New Verification Request',
            'description' => "{$this->borrower->full_name} submitted borrower verification.",
            'action_url' => "/borrowers/{$this->borrower->id}",
            'borrower' => $this->borrower->full_name,
        ];
    }
}
