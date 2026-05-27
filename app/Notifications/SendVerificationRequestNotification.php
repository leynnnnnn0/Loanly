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
        return ['mail', 'broadcast'];
    }

    public function toMail(object $notifiable): SendVerificationMail
    {
        return new SendVerificationMail($this->borrower)
            ->to($notifiable->email);
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => 'New Verification Request',
            'borrower' => $this->borrower->full_name,
        ]);
    }
}
