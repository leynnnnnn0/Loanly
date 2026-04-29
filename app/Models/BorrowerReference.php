<?php

namespace App\Models;

use App\Concerns\HasBorrower;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorrowerReference extends Model
{
    /** @use HasFactory<\Database\Factories\BorrowerReferenceFactory> */
    use HasFactory, HasBorrower;

    protected $fillable = [
        'borrower_id',
        'first_name',
        'last_name',
        'phone_number',
        'address',
        'relationship'
    ];

    

}
