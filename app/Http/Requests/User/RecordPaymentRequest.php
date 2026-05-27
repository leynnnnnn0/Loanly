<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class RecordPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->borrower !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,bank_transfer,gcash,paymaya,check'],
            'payment_date' => ['required', 'date'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'receipt_number' => ['nullable', 'string', 'max:100'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'mimes:jpeg,jpg,png,gif,webp,pdf', 'max:5120'],
        ];
    }
}
