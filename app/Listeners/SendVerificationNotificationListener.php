<?php

namespace App\Listeners;

use App\Events\BorrowerRegistered;
use App\Models\User;
use App\Notifications\SendVerificationRequestNotification;

class SendVerificationNotificationListener
{
    public function handle(BorrowerRegistered $event): void
    {
        $admin = User::where('role', 'admin')->first();
        $admin->notify(new SendVerificationRequestNotification($event->borrower));
    }
}
