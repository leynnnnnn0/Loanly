<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\RejectLoanRequest;
use App\Http\Requests\Admin\RejectPaymentRequest;
use App\Http\Requests\Admin\SavePenaltyRequest;
use App\Http\Requests\Admin\SaveRebateRequest;
use App\Services\AdminLoanManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoanManagementController extends Controller
{
    public function index(Request $request, AdminLoanManagementService $loans)
    {
        return Inertia::render('Admin/LoanManagement/Index', $loans->indexData($request));
    }

    public function show($id, AdminLoanManagementService $loans)
    {
        return Inertia::render('Admin/LoanManagement/Show', ['loan' => $loans->findForShow($id)]);
    }

    public function approveLoan($id, AdminLoanManagementService $loans)
    {
        $loan = $loans->approveLoan($id);

        return back()->with('success', "Loan {$loan->contract_number} approved and promissory note sent.");
    }

    public function rejectLoan(RejectLoanRequest $request, $id, AdminLoanManagementService $loans)
    {
        $loan = $loans->rejectLoan($id, $request->validated('void_reason'));

        return back()->with('success', "Loan {$loan->contract_number} rejected.");
    }

    public function approvePayment($historyId, AdminLoanManagementService $loans)
    {
        $loans->approvePayment($historyId);

        return back()->with('success', 'Payment approved. Overpayment cascaded to next schedules.');
    }

    public function rejectPayment(RejectPaymentRequest $request, $historyId, AdminLoanManagementService $loans)
    {
        $loans->rejectPayment($historyId, $request->validated('remarks'));

        return back()->with('success', 'Payment rejected.');
    }

    public function addPenalty(SavePenaltyRequest $request, $scheduleId, AdminLoanManagementService $loans)
    {
        $loans->savePenalty($scheduleId, $request->validated('penalty_amount'));

        return back()->with('success', 'Penalty saved.');
    }

    public function updatePenalty(SavePenaltyRequest $request, $scheduleId, AdminLoanManagementService $loans)
    {
        return $this->addPenalty($request, $scheduleId, $loans);
    }

    public function addRebate(SaveRebateRequest $request, $scheduleId, AdminLoanManagementService $loans)
    {
        $loans->saveRebate(
            $scheduleId,
            $request->validated('rebate_amount'),
            $request->validated('rebate_remarks')
        );

        return back()->with('success', 'Rebate saved.');
    }

    public function updateRebate(SaveRebateRequest $request, $scheduleId, AdminLoanManagementService $loans)
    {
        return $this->addRebate($request, $scheduleId, $loans);
    }
}
