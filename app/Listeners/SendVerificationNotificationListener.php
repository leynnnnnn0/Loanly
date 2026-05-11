<?php

namespace App\Listeners;

use App\Events\BorrowerRegistered;
use App\Models\User;
use App\Notifications\SendVerificationRequestNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendVerificationNotificationListener
{
    public function handle(BorrowerRegistered $event): void
    {
        $admin = User::where('role', 'admin')->first();
        $admin->notify(new SendVerificationRequestNotification($event->borrower));
    }
}
