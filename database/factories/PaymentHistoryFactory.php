<?php

namespace Database\Factories;

use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentHistory>
 */
class PaymentHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'payment_schedule_id' => PaymentSchedule::factory(),
            'amount_paid' => fake()->numberBetween(500, 5000),
            'payment_date' => now()->toDateString(),
            'payment_method' => 'cash',
            'reference_number' => fake()->optional()->bothify('REF-####'),
            'receipt_number' => fake()->optional()->bothify('OR-####'),
            'status' => 'for_approval',
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }
}
