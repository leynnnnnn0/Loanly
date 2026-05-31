<?php

use App\Events\BorrowerRegistered;
use App\Models\Borrower;
use App\Models\BorrowerIdentification;
use App\Models\BorrowerReference;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function borrowerProfilePayload(array $overrides = []): array
{
    return array_replace_recursive([
        'first_name' => 'Nathaniel',
        'last_name' => 'Alvarez',
        'phone_number' => '09171234567',
        'address' => 'Makati City',
        'date_of_birth' => now()->subYears(25)->toDateString(),
        'nationality' => 'Filipino',
        'id_type' => 'passport',
        'id_number' => 'P1234567',
        'issue_date' => now()->subYears(2)->toDateString(),
        'expiry_date' => now()->addYears(3)->toDateString(),
        'id_image' => UploadedFile::fake()->image('passport.jpg'),
        'references' => [
            [
                'first_name' => 'Ana',
                'last_name' => 'Santos',
                'phone_number' => '09170000001',
                'address' => 'Quezon City',
                'relationship' => 'friend',
            ],
            [
                'first_name' => 'Ben',
                'last_name' => 'Reyes',
                'phone_number' => '09170000002',
                'address' => 'Pasig City',
                'relationship' => 'sibling',
            ],
            [
                'first_name' => 'Cara',
                'last_name' => 'Cruz',
                'phone_number' => '09170000003',
                'address' => 'Taguig City',
                'relationship' => 'parent',
            ],
        ],
    ], $overrides);
}

test('borrower profile submission creates the borrower aggregate', function () {
    Storage::fake('public');
    Event::fake([BorrowerRegistered::class]);

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post('/user/profile', borrowerProfilePayload());

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/user/profile');

    $borrower = Borrower::query()
        ->where('user_id', $user->id)
        ->with(['identification', 'references'])
        ->firstOrFail();

    expect($borrower->account_status)->toBe('pending')
        ->and($borrower->references)->toHaveCount(3)
        ->and($borrower->identification->id_number)->toBe('P1234567');

    Storage::disk('public')->assertExists($borrower->identification->image_path);
    Event::assertDispatched(BorrowerRegistered::class);
});

test('borrower profile updates reset review state and keep the existing image when no replacement is uploaded', function () {
    Storage::fake('public');
    Event::fake([BorrowerRegistered::class]);

    $user = User::factory()->create();
    $borrower = Borrower::factory()
        ->for($user)
        ->rejected()
        ->create();

    BorrowerIdentification::factory()
        ->for($borrower)
        ->create(['image_path' => 'borrower-ids/original.jpg']);
    BorrowerReference::factory()
        ->count(3)
        ->for($borrower)
        ->create();

    Storage::disk('public')->put('borrower-ids/original.jpg', 'existing-file');

    $payload = borrowerProfilePayload([
        'first_name' => 'Updated',
        'id_number' => 'P7654321',
    ]);
    unset($payload['id_image']);

    $response = $this
        ->actingAs($user)
        ->post('/user/profile', $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/user/profile');

    $borrower->refresh()->load(['identification', 'references']);

    expect($borrower->first_name)->toBe('Updated')
        ->and($borrower->account_status)->toBe('pending')
        ->and($borrower->rejection_reason)->toBeNull()
        ->and($borrower->identification->id_number)->toBe('P7654321')
        ->and($borrower->identification->image_path)->toBe('borrower-ids/original.jpg')
        ->and($borrower->references)->toHaveCount(3);

    Event::assertNotDispatched(BorrowerRegistered::class);
});

test('reverification preloads the existing identification image preview', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $borrower = Borrower::factory()
        ->for($user)
        ->rejected()
        ->create();

    BorrowerIdentification::factory()
        ->for($borrower)
        ->create(['image_path' => 'borrower-ids/original.jpg']);

    Storage::disk('public')->put('borrower-ids/original.jpg', 'existing-file');

    $this
        ->actingAs($user)
        ->get(route('user.verification', ['id' => $borrower->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('User/Verification/Index')
            ->where('borrower.identification.id_image_url', '/storage/borrower-ids/original.jpg')
        );
});
