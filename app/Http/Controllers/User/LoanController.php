<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\RecordPaymentRequest;
use App\Http\Requests\User\StoreLoanApplicationRequest;
use App\Http\Requests\User\VoidLoanRequest;
use App\Models\PaymentSchedule;
use App\Services\LoanPaymentService;
use App\Services\UserLoanService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function index(UserLoanService $loans)
    {
        $user = Auth::user()->load('borrower');

        return Inertia::render('User/Loan/Index', $loans->indexData($user->borrower));
    }

    public function create(UserLoanService $loans)
    {
        $user = Auth::user()->load('borrower');
        $borrower = $user->borrower;

        abort_if(! $borrower || $borrower->account_status !== 'verified', 403);

        return Inertia::render('User/Loan/Create', [
            'borrower' => $borrower,
            ...$loans->borrowingCapacity($borrower),
        ]);
    }

    public function store(StoreLoanApplicationRequest $request, UserLoanService $loans)
    {
        $loans->submitApplication($request->user()->borrower, $request->validated());

        return redirect()->to('/user/my-loans')
            ->with('success', 'Loan application submitted successfully!');
    }

    public function show(int $id, UserLoanService $loans)
    {
        $user = Auth::user()->load('borrower');
        abort_if(! $user->borrower, 403);

        return Inertia::render('User/Loan/Show', [
            'loan' => $loans->showData($loans->findOwnedLoan($user->borrower, $id)),
        ]);
    }

    public function void(VoidLoanRequest $request, int $id, UserLoanService $loans)
    {
        $loans->void(
            $loans->findOwnedLoan($request->user()->borrower, $id),
            $request->validated()
        );

        return redirect()->to('/user/my-loans')
            ->with('success', 'Loan application cancelled successfully.');
    }

    public function recordPayment(
        RecordPaymentRequest $request,
        int $scheduleId,
        LoanPaymentService $payments
    ) {
        $user = Auth::user()->load('borrower');
        $schedule = PaymentSchedule::with('loan')->findOrFail($scheduleId);

        $payments->submit(
            $user->borrower,
            $schedule,
            $request->validated(),
            $request->file('attachments', [])
        );

        return back()->with('success', 'Payment submitted! It will be reflected once approved by admin.');
    }
}
