<?php

namespace Database\Factories;

use App\Models\LoanAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoanAttachment>
 */
class LoanAttachmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'image_path' => 'loan_attachments/example.pdf',
        ];
    }
}
