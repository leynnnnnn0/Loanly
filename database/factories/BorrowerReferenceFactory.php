<?php

namespace Database\Factories;

use App\Models\Borrower;
use App\Models\BorrowerReference;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BorrowerReference>
 */
class BorrowerReferenceFactory extends Factory
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
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone_number' => fake()->numerify('09#########'),
            'address' => fake()->address(),
            'relationship' => fake()->randomElement(['parent', 'sibling', 'friend', 'spouse']),
        ];
    }
}
