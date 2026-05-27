<?php

use App\Models\Borrower;
use App\Models\Loan;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('verified borrower can submit a loan application and schedules are generated', function () {
    $user = User::factory()->create();
    $borrower = Borrower::factory()->for($user)->verified()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('user.loans.store'), [
            'amount' => 12000,
            'loan_duration' => 3,
            'transaction_date' => now()->toDateString(),
            'reason' => 'Working capital',
            'payment_frequency' => 'monthly',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/user/my-loans');

    $loan = Loan::query()->where('borrower_id', $borrower->id)->firstOrFail();

    expect($loan->status)->toBe('pending')
        ->and($loan->interest_type)->toBe('percentage')
        ->and((float) $loan->interest_value)->toBe(2.0)
        ->and($loan->payment_schedules)->toHaveCount(3);
});

test('loan application rejects amounts above borrower capacity', function () {
    $user = User::factory()->create();
    $borrower = Borrower::factory()->for($user)->verified()->create();
    Loan::factory()
        ->for($borrower)
        ->active()
        ->create(['amount' => 19500, 'max_amount_to_borrow' => 20000]);

    $response = $this
        ->actingAs($user)
        ->from('/user/my-loans/apply')
        ->post(route('user.loans.store'), [
            'amount' => 1000,
            'loan_duration' => 1,
            'transaction_date' => now()->toDateString(),
            'reason' => 'Emergency',
            'payment_frequency' => 'monthly',
        ]);

    $response
        ->assertRedirect('/user/my-loans/apply')
        ->assertSessionHasErrors('amount');
});

test('borrower can void only their pending loan', function () {
    $user = User::factory()->create();
    $borrower = Borrower::factory()->for($user)->verified()->create();
    $loan = Loan::factory()->for($borrower)->create(['status' => 'pending']);
    PaymentSchedule::factory()->for($loan)->create(['status' => 'pending']);

    $response = $this
        ->actingAs($user)
        ->post(route('user.loans.void', $loan), [
            'void_reason' => 'No longer needed',
        ]);

    $response->assertRedirect('/user/my-loans');

    expect($loan->refresh()->status)->toBe('voided')
        ->and($loan->payment_schedules()->first()->status)->toBe('cancelled');
});

test('borrower payment submissions are recorded for approval', function () {
    $user = User::factory()->create();
    $borrower = Borrower::factory()->for($user)->verified()->create();
    $loan = Loan::factory()->for($borrower)->active()->create();
    $schedule = PaymentSchedule::factory()->for($loan)->create(['status' => 'pending']);

    $response = $this
        ->actingAs($user)
        ->post(route('user.loans.pay', $schedule), [
            'amount_paid' => 500,
            'payment_method' => 'cash',
            'payment_date' => now()->toDateString(),
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $history = PaymentHistory::query()->where('payment_schedule_id', $schedule->id)->firstOrFail();

    expect($history->status)->toBe('for_approval')
        ->and((float) $history->amount_paid)->toBe(500.0);
});
