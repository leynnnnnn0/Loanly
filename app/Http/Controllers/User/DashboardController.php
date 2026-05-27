<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\UserLoanService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(UserLoanService $loans)
    {
        $user = Auth::user()->load('borrower');
        $borrower = $user->borrower;
        $isVerified = $borrower && $borrower->account_status === 'verified';
        $dashboard = $loans->dashboardData($borrower);

        return Inertia::render('User/Dashboard/Index', [
            'borrower' => $borrower,
            'isVerified' => $isVerified,
            ...$dashboard,
        ]);
    }
}
