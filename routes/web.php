<?php

use App\Http\Controllers\LoanManagementController;
use App\Http\Controllers\BorrowerController;
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

Route::prefix('admin')->middleware(['auth'])->group(function () {
    // Loan management
    Route::get('/loans',                  [LoanManagementController::class, 'index'])->name('admin.loans.index');
    Route::get('/loans/{id}',             [LoanManagementController::class, 'show'])->name('admin.loans.show');
    Route::post('/loans/{id}/approve',     [LoanManagementController::class, 'approveLoan'])->name('admin.loans.approve');
    Route::post('/loans/{id}/reject',      [LoanManagementController::class, 'rejectLoan'])->name('admin.loans.reject');

    // Payment approval
    Route::post('/payments/{historyId}/approve', [LoanManagementController::class, 'approvePayment'])->name('admin.payments.approve');
    Route::post('/payments/{historyId}/reject',  [LoanManagementController::class, 'rejectPayment'])->name('admin.payments.reject');

    // Schedule adjustments
    Route::post('/loans/schedules/{scheduleId}/penalty', [LoanManagementController::class, 'addPenalty'])->name('admin.loans.penalty.add');
    Route::put('/loans/schedules/{scheduleId}/penalty', [LoanManagementController::class, 'updatePenalty'])->name('admin.loans.penalty.update');
    Route::post('/loans/schedules/{scheduleId}/rebate',  [LoanManagementController::class, 'addRebate'])->name('admin.loans.rebate.add');
    Route::put('/loans/schedules/{scheduleId}/rebate',  [LoanManagementController::class, 'updateRebate'])->name('admin.loans.rebate.update');
});

Route::prefix('user')->group(function(){
    Route::get('/my-loans', [LoanController::class, 'index']);
    Route::post('/my-loans', [LoanController::class, 'store']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/my-loans/apply', [LoanController::class, 'create']);
    Route::get('/my-loans/{id}', [LoanController::class, 'show']);
    Route::get('/settings', [SettingsController::class, 'index']);

    Route::get('/profile', [ProfileController::class, 'index']);
    Route::post('/profile', [ProfileController::class, 'store']);

    Route::get('/verification', [VerificationController::class, 'index']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/borrowers', [BorrowerController::class, 'index']);
Route::get('/borrowers/{borrower}', [BorrowerController::class, 'show']);

Route::prefix('user')->middleware(['auth'])->group(function () {

    Route::get('/my-loans',         [LoanController::class, 'index'])->name('user.loans.index');
    Route::get('/my-loans/apply',   [LoanController::class, 'create'])->name('user.loans.create');
    Route::post('/loans',            [LoanController::class, 'store'])->name('user.loans.store');
    Route::get('/my-loans/{id}',    [LoanController::class, 'show'])->name('user.loans.show');

    Route::post('/loans/{id}/void', [LoanController::class, 'void'])->name('user.loans.void');

    Route::post('/loans/schedules/{scheduleId}/pay',     [LoanController::class, 'recordPayment'])->name('user.loans.pay');
    Route::post('/loans/schedules/{scheduleId}/penalty', [LoanController::class, 'addPenalty'])->name('user.loans.penalty.add');
    Route::put('/loans/schedules/{scheduleId}/penalty', [LoanController::class, 'updatePenalty'])->name('user.loans.penalty.update');


    
});

Route::put('/admin/borrowers/{borrower}/verify', [BorrowerController::class, 'verify']);


require __DIR__.'/settings.php';
