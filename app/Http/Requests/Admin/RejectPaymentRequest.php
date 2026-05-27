<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, string>
     */
    public function rules(): array
    {
        return [
            'remarks' => 'nullable|string|max:500',
        ];
    }
}
