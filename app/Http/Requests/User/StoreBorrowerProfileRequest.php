<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreBorrowerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $hasBorrower = $this->user()?->borrower()->exists() ?? false;

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone_number' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:-18 years'],
            'nationality' => ['required', 'string', 'max:100'],

            'id_type' => ['required', 'string', 'max:100'],
            'id_number' => ['required', 'string', 'max:100'],
            'issue_date' => ['required', 'date', 'before:today'],
            'expiry_date' => ['required', 'date', 'after:today'],
            'id_image' => [
                $hasBorrower ? 'nullable' : 'required',
                'image',
                'mimes:jpg,jpeg,png',
                'max:10240',
            ],

            'references' => ['required', 'array', 'min:3'],
            'references.*.first_name' => ['required', 'string', 'max:100'],
            'references.*.last_name' => ['required', 'string', 'max:100'],
            'references.*.phone_number' => ['required', 'string', 'max:20'],
            'references.*.address' => ['required', 'string', 'max:255'],
            'references.*.relationship' => ['required', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date_of_birth.before' => 'You must be at least 18 years old.',
            'expiry_date.after' => 'Your ID must not be expired.',
            'issue_date.before' => 'Issue date must be in the past.',
            'references.min' => 'Please provide at least 3 references.',
        ];
    }
}
