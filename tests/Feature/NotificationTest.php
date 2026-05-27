<?php

use App\Models\User;
use App\Notifications\LoanActivityNotification;

test('users can read mark and delete stored notifications', function () {
    $user = User::factory()->create();

    $user->notify(new LoanActivityNotification(
        'Loan approved',
        'Your loan was approved.',
        '/user/my-loans/1',
    ));

    $notification = $user->notifications()->firstOrFail();

    $this
        ->actingAs($user)
        ->getJson(route('notifications.index'))
        ->assertOk()
        ->assertJsonPath('unread_count', 1)
        ->assertJsonPath('notifications.0.message', 'Loan approved');

    $this
        ->actingAs($user)
        ->patchJson(route('notifications.read', $notification))
        ->assertOk();

    expect($notification->refresh()->read_at)->not->toBeNull();

    $this
        ->actingAs($user)
        ->deleteJson(route('notifications.destroy', $notification))
        ->assertOk();

    expect($user->notifications()->count())->toBe(0);
});
