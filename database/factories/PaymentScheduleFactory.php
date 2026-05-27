<?php

namespace Database\Factories;

use App\Models\Loan;
use App\Models\PaymentSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentSchedule>
 */
class PaymentScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'loan_id' => Loan::factory(),
            'amount_due' => fake()->numberBetween(500, 5000),
            'rebate_amount' => 0,
            'penalty_amount' => 0,
            'due_date' => now()->addMonth()->toDateString(),
            'status' => 'pending',
        ];
    }
}
