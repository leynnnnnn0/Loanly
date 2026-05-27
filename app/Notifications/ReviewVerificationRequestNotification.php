<?php

namespace App\Notifications;

use App\Models\Borrower;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewVerificationRequestNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Borrower $borrower)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    public function toBroadcast(object $notifiable)
    {
        $accountStatus = $this->borrower->account_status;
        $message = $accountStatus == 'verified' ? 'Your account is now verified' : 'You account verification request is declined';
        $description = $accountStatus == 'verified' ? 'You can now request to get a loan up to 20,000' : 'Your application is rejected. Go to profile page to see the reason';

        return new BroadcastMessage($this->toArray($notifiable));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $accountStatus = $this->borrower->account_status;
        $message = $accountStatus == 'verified' ? 'Your account is now verified' : 'Your account verification request was declined';
        $description = $accountStatus == 'verified' ? 'You can now request to get a loan up to 20,000.' : 'Your application was rejected. Go to your profile page to see the reason.';

        return [
            'message' => $message,
            'description' => $description,
            'action_url' => '/user/profile',
        ];
    }
}
