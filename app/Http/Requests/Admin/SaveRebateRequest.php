<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaveRebateRequest extends FormRequest
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
            'rebate_amount' => 'required|numeric|min:0',
            'rebate_remarks' => 'nullable|string|max:500',
        ];
    }
}
