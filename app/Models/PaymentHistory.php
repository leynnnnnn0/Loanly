<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentHistory extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentHistoryFactory> */
    use HasFactory;

    protected $fillable = [
        'payment_schedule_id',
        'amount_paid',
        'payment_method',
        'reference_number',
        'receipt_number',
        'payment_date',
        'status',
        'remarks',
    ];

    public function payment_schedule()
    {
        return $this->belongsTo(PaymentSchedule::class);
    }

    public function attachments()
    {
        return $this->hasMany(PaymentAttachment::class);
    }
}
