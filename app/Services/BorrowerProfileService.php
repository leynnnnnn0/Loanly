<?php

namespace App\Services;

use App\Events\BorrowerRegistered;
use App\Models\Borrower;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BorrowerProfileService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function submit(User $user, array $data, ?UploadedFile $idImage = null): Borrower
    {
        return DB::transaction(function () use ($user, $data, $idImage) {
            $borrower = $user->borrower()->with('identification')->first();
            $isNewBorrower = $borrower === null;

            $borrower = $this->saveBorrower($user, $borrower, $data);
            $this->saveIdentification($borrower, $data, $idImage);
            $this->replaceReferences($borrower, $data['references']);

            if ($isNewBorrower) {
                BorrowerRegistered::dispatch($borrower);
            }

            return $borrower;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function saveBorrower(User $user, ?Borrower $borrower, array $data): Borrower
    {
        $attributes = Arr::only($data, [
            'first_name',
            'last_name',
            'phone_number',
            'address',
            'date_of_birth',
            'nationality',
        ]);

        if ($borrower) {
            $borrower->update([
                ...$attributes,
                'account_status' => 'pending',
                'rejection_reason' => null,
            ]);

            return $borrower;
        }

        return Borrower::create([
            ...$attributes,
            'user_id' => $user->id,
            'account_status' => 'pending',
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function saveIdentification(Borrower $borrower, array $data, ?UploadedFile $idImage): void
    {
        $attributes = Arr::only($data, [
            'id_type',
            'id_number',
            'issue_date',
            'expiry_date',
        ]);

        if ($idImage) {
            $this->deleteExistingIdentificationImage($borrower);
            $attributes['image_path'] = $idImage->store('borrower-ids', 'public');
        }

        $borrower->identification()->updateOrCreate(
            ['borrower_id' => $borrower->id],
            $attributes
        );
    }

    private function deleteExistingIdentificationImage(Borrower $borrower): void
    {
        $imagePath = $borrower->identification?->image_path;

        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $references
     */
    private function replaceReferences(Borrower $borrower, array $references): void
    {
        $borrower->references()->delete();

        foreach ($references as $reference) {
            $borrower->references()->create($reference);
        }
    }
}
