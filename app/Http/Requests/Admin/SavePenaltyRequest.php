<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SavePenaltyRequest extends FormRequest
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
            'penalty_amount' => 'required|numeric|min:0',
        ];
    }
}
