<?php

use App\Mail\LoanApprovedMail;
use App\Models\Borrower;
use App\Models\Loan;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('admin can reject a pending loan and cancel its pending schedules', function () {
    $admin = User::factory()->create();
    $borrower = Borrower::factory()->verified()->create();
    $loan = Loan::factory()->for($borrower)->create(['status' => 'pending']);
    $schedule = PaymentSchedule::factory()->for($loan)->create(['status' => 'pending']);

    $response = $this
        ->actingAs($admin)
        ->from(route('admin.loans.show', $loan))
        ->post(route('admin.loans.reject', $loan), [
            'void_reason' => 'Incomplete documents.',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.loans.show', $loan));

    expect($loan->refresh()->status)->toBe('rejected')
        ->and($loan->remarks)->toBe('Incomplete documents.')
        ->and($schedule->refresh()->status)->toBe('cancelled');
});

test('admin approving an overpayment cascades the excess to the next schedule', function () {
    $admin = User::factory()->create();
    $borrower = Borrower::factory()->verified()->create();
    $loan = Loan::factory()->for($borrower)->active()->create();
    $firstSchedule = PaymentSchedule::factory()
        ->for($loan)
        ->create(['amount_due' => 1000, 'status' => 'pending']);
    $nextSchedule = PaymentSchedule::factory()
        ->for($loan)
        ->create(['amount_due' => 1000, 'status' => 'pending', 'due_date' => now()->addMonths(2)]);
    $payment = PaymentHistory::factory()
        ->for($firstSchedule, 'payment_schedule')
        ->create(['amount_paid' => 1500, 'status' => 'for_approval']);

    $response = $this
        ->actingAs($admin)
        ->from(route('admin.loans.show', $loan))
        ->post(route('admin.payments.approve', $payment));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.loans.show', $loan));

    $carryOver = PaymentHistory::query()
        ->where('payment_schedule_id', $nextSchedule->id)
        ->where('status', 'approved')
        ->firstOrFail();

    expect($payment->refresh()->status)->toBe('approved')
        ->and((float) $payment->amount_paid)->toBe(1000.0)
        ->and($firstSchedule->refresh()->status)->toBe('paid')
        ->and($nextSchedule->refresh()->status)->toBe('pending')
        ->and((float) $carryOver->amount_paid)->toBe(500.0);
});

test('admin can approve a pending loan without rendering mail inline in the controller', function () {
    Mail::fake();

    $admin = User::factory()->create();
    $borrower = Borrower::factory()->verified()->create();
    $loan = Loan::factory()->for($borrower)->create(['status' => 'pending']);

    $response = $this
        ->actingAs($admin)
        ->from(route('admin.loans.show', $loan))
        ->post(route('admin.loans.approve', $loan));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.loans.show', $loan));

    expect($loan->refresh()->status)->toBe('active');

    Mail::assertQueued(LoanApprovedMail::class);
});

test('admin rebate marks a schedule paid when approved payments cover the adjusted due amount', function () {
    $admin = User::factory()->create();
    $borrower = Borrower::factory()->verified()->create();
    $loan = Loan::factory()->for($borrower)->active()->create();
    $schedule = PaymentSchedule::factory()
        ->for($loan)
        ->create(['amount_due' => 1000, 'status' => 'pending']);

    PaymentHistory::factory()
        ->for($schedule, 'payment_schedule')
        ->approved()
        ->create(['amount_paid' => 800]);

    $response = $this
        ->actingAs($admin)
        ->from(route('admin.loans.show', $loan))
        ->post(route('admin.loans.rebate.add', $schedule), [
            'rebate_amount' => 200,
            'rebate_remarks' => 'Early settlement.',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.loans.show', $loan));

    expect($schedule->refresh()->status)->toBe('paid')
        ->and((float) $schedule->rebate_amount)->toBe(200.0)
        ->and($schedule->rebate_remarks)->toBe('Early settlement.');
});
