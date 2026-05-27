<?php

namespace App\Services;

use App\Models\Borrower;
use App\Models\PaymentHistory;
use App\Models\PaymentSchedule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class LoanPaymentService
{
    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, UploadedFile>  $attachments
     */
    public function submit(Borrower $borrower, PaymentSchedule $schedule, array $data, array $attachments = []): PaymentHistory
    {
        $schedule->loadMissing('loan');

        abort_if($schedule->loan->borrower_id !== $borrower->id, 403);
        abort_if($schedule->loan->is_voided, 403);
        abort_if($schedule->loan->status !== 'active', 422, 'Loan is not active.');
        abort_if($schedule->status === 'paid', 422, 'This schedule is already paid.');

        return DB::transaction(function () use ($data, $schedule, $attachments) {
            $history = PaymentHistory::create([
                'payment_schedule_id' => $schedule->id,
                'amount_paid' => $data['amount_paid'],
                'payment_method' => $data['payment_method'],
                'payment_date' => $data['payment_date'],
                'reference_number' => $data['reference_number'] ?? null,
                'receipt_number' => $data['receipt_number'] ?? null,
                'status' => 'for_approval',
            ]);

            foreach ($attachments as $file) {
                $history->attachments()->create([
                    'image_path' => $file->store("payment_attachments/{$history->id}", 'public'),
                ]);
            }

            return $history;
        });
    }
}
