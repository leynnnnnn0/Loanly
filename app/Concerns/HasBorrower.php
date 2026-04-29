<?php

namespace App\Concerns;

use App\Models\Borrower;

trait HasBorrower
{
    public function borrower()
    {
        return $this->belongsTo(Borrower::class);
    }
}
