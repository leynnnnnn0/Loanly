<?php

namespace App\Models;

use App\Concerns\HasBorrower;
use Database\Factories\BorrowerReferenceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorrowerReference extends Model
{
    /** @use HasFactory<BorrowerReferenceFactory> */
    use HasBorrower, HasFactory;

    protected $fillable = [
        'borrower_id',
        'first_name',
        'last_name',
        'phone_number',
        'address',
        'relationship',
    ];
}
