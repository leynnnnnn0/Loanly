<?php

namespace App\Listeners;

use App\Events\ReviewVerficationEvent;
use App\Notifications\ReviewVerificationRequestNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class ReviewVerificationRequestListener implements ShouldQueue
{
    public function handle(ReviewVerficationEvent $event): void
    {
        $user = $event->borrower->user;
        $user->notify(new ReviewVerificationRequestNotification($event->borrower));
    }
}
