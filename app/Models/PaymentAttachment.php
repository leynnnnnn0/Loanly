<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentAttachment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentAttachmentFactory> */
    use HasFactory;

    protected $fillable = [
        'payment_history_id',
        'image_path'
    ];

    public function payment_history()
    {
        return $this->belongsTo(PaymentHistory::class);
    }
}
