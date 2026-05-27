<?php

namespace Database\Factories;

use App\Models\Borrower;
use App\Models\BorrowerIdentification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BorrowerIdentification>
 */
class BorrowerIdentificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'borrower_id' => Borrower::factory(),
            'image_path' => 'borrower-ids/sample-id.jpg',
            'id_type' => 'passport',
            'id_number' => fake()->unique()->bothify('ID-#######'),
            'issue_date' => now()->subYears(2)->toDateString(),
            'expiry_date' => now()->addYears(3)->toDateString(),
        ];
    }
}
