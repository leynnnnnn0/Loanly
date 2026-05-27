<?php

namespace App\Models;

use Database\Factories\LoanAttachmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoanAttachment extends Model
{
    /** @use HasFactory<LoanAttachmentFactory> */
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'image_path',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }
}
