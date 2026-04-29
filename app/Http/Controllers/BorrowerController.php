<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BorrowerController extends Controller
{
    /**
     * List all borrowers with search, filter, and pagination.
     */
    public function index(Request $request)
    {
        $query = Borrower::query()
            ->with(['identification:id,borrower_id,id_type,id_number'])
            ->withCount('loans');

        // Search by name, phone, or ID number
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%")
                    ->orWhereHas(
                        'identification',
                        fn($q) =>
                        $q->where('id_number', 'like', "%{$search}%")
                    );
            });
        }

        // Filter by account status
        if ($status = $request->input('status')) {
            $query->where('account_status', $status);
        }

        $borrowers = $query
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Stat counts (across all borrowers, not filtered)
        $stats = [
            'total'    => Borrower::count(),
            'pending'  => Borrower::where('account_status', 'pending')->count(),
            'verified' => Borrower::where('account_status', 'verified')->count(),
            'rejected' => Borrower::where('account_status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Borrower/Index', [
            'borrowers' => $borrowers,
            'filters'   => $request->only('search', 'status'),
            'stats'     => $stats,
        ]);
    }

    /**
     * Show a single borrower with all relations.
     */
    public function show(Borrower $borrower)
    {
        $borrower->load([
            'user:id,username,email',
            'identification',
            'references',
            'loans:id,borrower_id,contract_number,amount,status,transaction_date',
        ]);


        return Inertia::render('Admin/Borrower/Show', [
            'borrower' => $borrower,
        ]);
    }

    public function verify(Borrower $borrower)
    {
        abort_if(
            $borrower->account_status === 'verified',
            422,
            'Borrower is already verified.'
        );

        $borrower->update(['account_status' => 'verified']);

        return back()->with('success', 'Borrower verified successfully.');
    }

    public function reject(Request $request, Borrower $borrower)
    {
        abort_if(
            $borrower->account_status === 'verified',
            422,
            'Cannot reject an already verified borrower.'
        );

        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $borrower->update([
            'account_status'   => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        return back()->with('success', 'Borrower rejected.');
    }
}
