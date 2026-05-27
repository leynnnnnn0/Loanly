<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Services\AdminBorrowerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BorrowerController extends Controller
{
    /**
     * List all borrowers with search, filter, and pagination.
     */
    public function index(Request $request, AdminBorrowerService $borrowers)
    {
        return Inertia::render('Admin/Borrower/Index', $borrowers->indexData($request));
    }

    /**
     * Show a single borrower with all relations.
     */
    public function show(Borrower $borrower, AdminBorrowerService $borrowers)
    {
        return Inertia::render('Admin/Borrower/Show', [
            'borrower' => $borrowers->loadDetails($borrower),
        ]);
    }

    public function verify(Borrower $borrower, AdminBorrowerService $borrowers)
    {
        $borrowers->verify($borrower);

        return back()->with('success', 'Borrower verified successfully.');
    }

    public function reject(Request $request, Borrower $borrower, AdminBorrowerService $borrowers)
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $borrowers->reject($borrower, $validated['rejection_reason']);

        return back()->with('success', 'Borrower rejected.');
    }

    public function creditScore(Borrower $borrower): JsonResponse
    {
        return response()->json($borrower->getCreditScore());
    }
}
