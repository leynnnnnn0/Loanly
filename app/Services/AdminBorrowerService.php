<?php

namespace App\Services;

use App\Events\ReviewVerficationEvent;
use App\Models\Borrower;
use Illuminate\Http\Request;

class AdminBorrowerService
{
    /**
     * @return array<string, mixed>
     */
    public function indexData(Request $request): array
    {
        $query = Borrower::query()
            ->with(['identification:id,borrower_id,id_type,id_number'])
            ->withCount('loans');

        $query->when($request->input('search'), function ($query, string $search) {
            $query->where(function ($query) use ($search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%")
                    ->orWhereHas(
                        'identification',
                        fn ($query) => $query->where('id_number', 'like', "%{$search}%")
                    );
            });
        });

        $query->when($request->input('status'), fn ($query, string $status) => $query->where('account_status', $status));

        return [
            'borrowers' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only('search', 'status'),
            'stats' => $this->stats(),
        ];
    }

    public function loadDetails(Borrower $borrower): Borrower
    {
        return $borrower->load([
            'user:id,username,email',
            'identification',
            'references',
            'loans:id,borrower_id,contract_number,amount,status,transaction_date',
        ]);
    }

    public function verify(Borrower $borrower): void
    {
        abort_if($borrower->account_status === 'verified', 422, 'Borrower is already verified.');

        $borrower->update(['account_status' => 'verified']);
        ReviewVerficationEvent::dispatch($borrower->fresh(['user']));
    }

    public function reject(Borrower $borrower, string $reason): void
    {
        abort_if($borrower->account_status === 'verified', 422, 'Cannot reject an already verified borrower.');

        $borrower->update([
            'account_status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        ReviewVerficationEvent::dispatch($borrower->fresh(['user']));
    }

    /**
     * @return array<string, int>
     */
    private function stats(): array
    {
        return [
            'total' => Borrower::count(),
            'pending' => Borrower::where('account_status', 'pending')->count(),
            'verified' => Borrower::where('account_status', 'verified')->count(),
            'rejected' => Borrower::where('account_status', 'rejected')->count(),
        ];
    }
}
