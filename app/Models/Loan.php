<?php

namespace App\Models;

use App\Concerns\HasBorrower;
use Database\Factories\LoanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    /** @use HasFactory<LoanFactory> */
    use HasBorrower, HasFactory;

    protected $fillable = [
        'borrower_id',
        'contract_number',
        'amount',
        'interest_type',
        'interest_value',
        'interest_period',
        'loan_duration',
        'duration_unit',
        'payment_frequency',
        'transaction_date',
        'reason',
        'is_voided',
        'voided_at',
        'void_reason',
        'status',
        'max_amount_to_borrow',
        'remarks',
    ];

    public function payment_schedules()
    {
        return $this->hasMany(PaymentSchedule::class);
    }
}
