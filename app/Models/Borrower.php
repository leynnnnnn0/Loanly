<?php

namespace App\Models;

use App\Services\CreditScoreService;
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

     // ─── Credit Score ─────────────────────────────────────────────────────────

    /**
     * Compute the borrower's credit score.
     *
     * Returns a structured array with:
     *  - score      (int  300-1000)
     *  - band       (string)
     *  - breakdown  (per-factor scores and weights)
     *  - meta       (raw payment stats)
     *
     * Usage:
     *   $result = $borrower->getCreditScore();
     *   echo $result['score'];  // e.g. 742
     *   echo $result['band'];   // e.g. "Good"
     */
    public function getCreditScore(): array
    {
        return app(CreditScoreService::class)->compute($this);
    }
}
