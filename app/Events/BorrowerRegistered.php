<?php

namespace App\Events;

use App\Models\Borrower;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BorrowerRegistered
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Borrower $borrower)
    {
        //
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
