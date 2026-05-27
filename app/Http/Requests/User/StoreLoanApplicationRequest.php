<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->borrower?->account_status === 'verified';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1000'],
            'loan_duration' => ['required', 'integer', 'min:1', 'max:3'],
            'transaction_date' => ['required', 'date'],
            'reason' => ['required', 'string', 'max:500'],
            'payment_frequency' => ['required', 'in:monthly,weekly'],
        ];
    }
}
