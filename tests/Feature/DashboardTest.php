<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('borrowers are redirected away from the admin dashboard', function () {
    $user = User::factory()->create(['role' => 'borrower']);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertRedirect('/user/dashboard');
});

test('admins are redirected away from borrower dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('user.dashboard'));

    $response->assertRedirect('/dashboard');
});
