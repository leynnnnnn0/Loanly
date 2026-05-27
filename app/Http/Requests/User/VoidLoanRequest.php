<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class VoidLoanRequest extends FormRequest
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
            'void_reason' => ['required', 'string', 'max:500'],
        ];
    }
}
