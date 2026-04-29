<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSchedule extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentScheduleFactory> */
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'due_date',
        'amount_due',
        'rebate_amount',
        'penalty_amount',
        'rebate_remarks',
        'status',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function payment_histories()
    {
        return $this->hasMany(PaymentHistory::class);
    }
}
