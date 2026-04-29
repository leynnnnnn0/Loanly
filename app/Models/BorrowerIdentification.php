<?php

namespace App\Models;

use App\Concerns\HasBorrower;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorrowerIdentification extends Model
{
    /** @use HasFactory<\Database\Factories\BorrowerIdentificationFactory> */
    use HasFactory, HasBorrower;


    protected $fillable = [
        'borrower_id',
        'image_path',
        'id_type',
        'id_number',
        'issue_date',
        'expiry_date',
    ];

}
