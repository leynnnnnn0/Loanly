<?php

namespace Database\Factories;

use App\Models\Borrower;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Borrower>
 */
class BorrowerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone_number' => fake()->unique()->numerify('09#########'),
            'address' => fake()->address(),
            'date_of_birth' => fake()->dateTimeBetween('-60 years', '-21 years')->format('Y-m-d'),
            'nationality' => 'Filipino',
            'account_status' => 'pending',
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_status' => 'verified',
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_status' => 'rejected',
            'rejection_reason' => 'Missing supporting details.',
        ]);
    }
}
