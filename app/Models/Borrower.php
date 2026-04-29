<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Borrower extends Model
{
    /** @use HasFactory<\Database\Factories\BorrowerFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'phone_number',
        'address',
        'date_of_birth',
        'nationality',
        'account_status',
        'account_remarks'
    ];

    protected $appends = [
        'full_name'
    ];

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function identification()
    {
        return $this->hasOne(BorrowerIdentification::class);
    }

    public function references()
    {
        return $this->hasMany(BorrowerReference::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }
}
