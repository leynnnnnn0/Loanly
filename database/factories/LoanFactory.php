<?php

namespace Database\Factories;

use App\Models\Borrower;
use App\Models\Loan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Loan>
 */
class LoanFactory extends Factory
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
            'contract_number' => 'LCN-'.fake()->unique()->numerify('########'),
            'amount' => fake()->numberBetween(1000, 20000),
            'interest_type' => 'percentage',
            'interest_value' => 2,
            'interest_period' => 'monthly',
            'loan_duration' => fake()->numberBetween(1, 3),
            'duration_unit' => 'months',
            'transaction_date' => now()->toDateString(),
            'reason' => fake()->sentence(),
            'payment_frequency' => fake()->randomElement(['monthly', 'weekly']),
            'is_voided' => false,
            'status' => 'pending',
            'max_amount_to_borrow' => 20000,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }
}
