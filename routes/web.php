<?php

use App\Http\Controllers\BorrowerController;
use App\Http\Controllers\DashboardController as ControllersDashboardController;
use App\Http\Controllers\LoanManagementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\User\DashboardController;
use App\Http\Controllers\User\LoanController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\SettingsController;
use App\Http\Controllers\User\VerificationController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/read', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::get('/borrowers/{borrower}/credit-score', [BorrowerController::class, 'creditScore'])
        ->name('borrowers.credit-score');
});

Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/loans', [LoanManagementController::class, 'index'])->name('admin.loans.index');
    Route::get('/loans/{id}', [LoanManagementController::class, 'show'])->name('admin.loans.show');
    Route::post('/loans/{id}/approve', [LoanManagementController::class, 'approveLoan'])->name('admin.loans.approve');
    Route::post('/loans/{id}/reject', [LoanManagementController::class, 'rejectLoan'])->name('admin.loans.reject');

    Route::post('/payments/{historyId}/approve', [LoanManagementController::class, 'approvePayment'])->name('admin.payments.approve');
    Route::post('/payments/{historyId}/reject', [LoanManagementController::class, 'rejectPayment'])->name('admin.payments.reject');

    Route::post('/loans/schedules/{scheduleId}/penalty', [LoanManagementController::class, 'addPenalty'])->name('admin.loans.penalty.add');
    Route::put('/loans/schedules/{scheduleId}/penalty', [LoanManagementController::class, 'updatePenalty'])->name('admin.loans.penalty.update');
    Route::post('/loans/schedules/{scheduleId}/rebate', [LoanManagementController::class, 'addRebate'])->name('admin.loans.rebate.add');
    Route::put('/loans/schedules/{scheduleId}/rebate', [LoanManagementController::class, 'updateRebate'])->name('admin.loans.rebate.update');

    Route::put('/borrowers/{borrower}/verify', [BorrowerController::class, 'verify']);
    Route::put('/borrowers/{borrower}/reject', [BorrowerController::class, 'reject']);
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/dashboard', [ControllersDashboardController::class, 'index'])->name('dashboard');
    Route::get('/sales', [SalesController::class, 'index'])->name('admin.sales.index');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/borrowers', [BorrowerController::class, 'index']);
    Route::get('/borrowers/{borrower}', [BorrowerController::class, 'show']);
});

Route::prefix('user')->middleware(['auth', 'role:borrower'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('user.dashboard');
    Route::get('/settings', [SettingsController::class, 'index'])->name('user.settings');
    Route::get('/profile', [ProfileController::class, 'index'])->name('user.profile');
    Route::post('/profile', [ProfileController::class, 'store'])->name('user.profile.store');
    Route::get('/verification', [VerificationController::class, 'index'])->name('user.verification');

    Route::get('/my-loans', [LoanController::class, 'index'])->name('user.loans.index');
    Route::get('/my-loans/apply', [LoanController::class, 'create'])->name('user.loans.create');
    Route::post('/my-loans', [LoanController::class, 'store'])->name('user.loans.store');
    Route::get('/my-loans/{id}', [LoanController::class, 'show'])->name('user.loans.show');

    Route::post('/loans/{id}/void', [LoanController::class, 'void'])->name('user.loans.void');

    Route::post('/loans/schedules/{scheduleId}/pay', [LoanController::class, 'recordPayment'])->name('user.loans.pay');
    Route::post('/loans/schedules/{scheduleId}/penalty', [LoanController::class, 'addPenalty'])->name('user.loans.penalty.add');
    Route::put('/loans/schedules/{scheduleId}/penalty', [LoanController::class, 'updatePenalty'])->name('user.loans.penalty.update');

});

require __DIR__.'/settings.php';
