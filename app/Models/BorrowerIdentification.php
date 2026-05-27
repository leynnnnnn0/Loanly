<?php

namespace App\Models;

use App\Concerns\HasBorrower;
use Database\Factories\BorrowerIdentificationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorrowerIdentification extends Model
{
    /** @use HasFactory<BorrowerIdentificationFactory> */
    use HasBorrower, HasFactory;

    protected $fillable = [
        'borrower_id',
        'image_path',
        'id_type',
        'id_number',
        'issue_date',
        'expiry_date',
    ];
}
