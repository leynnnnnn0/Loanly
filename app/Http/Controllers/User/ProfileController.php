<?php

namespace App\Http\Controllers\User;

use App\Events\BorrowerRegistered;
use App\Http\Controllers\Controller;
use App\Models\Borrower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $borrower = Borrower::query()
            ->where('user_id', Auth::id())
            ->with([
                'identification',
                'references',
            ])
            ->withCount('loans')
            ->first();

        if (!$borrower) {
            return Inertia::render('User/Verification/Index');
        }

        if ($borrower->identification?->image_path) {
            $borrower->identification->image_url = Storage::url(
                $borrower->identification->image_path
            );
        }

        return Inertia::render('User/Profile/Index', [
            'borrower' => $borrower,
        ]);
    }

    public function store(Request $request)
    {
        $isExisting = Borrower::where('user_id', Auth::id())->exists();

        $validated = $request->validate([
            'first_name'    => ['required', 'string', 'max:100'],
            'last_name'     => ['required', 'string', 'max:100'],
            'phone_number'  => ['required', 'string', 'max:20'],
            'address'       => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:-18 years'],
            'nationality'   => ['required', 'string', 'max:100'],

            'id_type'    => ['required', 'string', 'max:100'],
            'id_number'  => ['required', 'string', 'max:100'],
            'issue_date' => ['required', 'date', 'before:today'],
            'expiry_date' => ['required', 'date', 'after:today'],

            // Image is only required when creating a new borrower
            'id_image' => [
                $isExisting ? 'nullable' : 'required',
                'image',
                'mimes:jpg,jpeg,png',
                'max:10240',
            ],

            'references'                => ['required', 'array', 'min:3'],
            'references.*.first_name'   => ['required', 'string', 'max:100'],
            'references.*.last_name'    => ['required', 'string', 'max:100'],
            'references.*.phone_number' => ['required', 'string', 'max:20'],
            'references.*.address'      => ['required', 'string', 'max:255'],
            'references.*.relationship' => ['required', 'string', 'max:100'],
        ], [
            'date_of_birth.before' => 'You must be at least 18 years old.',
            'expiry_date.after'    => 'Your ID must not be expired.',
            'issue_date.before'    => 'Issue date must be in the past.',
            'references.min'       => 'Please provide at least 3 references.',
        ]);

        DB::transaction(function () use ($request, $validated, $isExisting) {
            $borrowerData = [
                'first_name'    => $validated['first_name'],
                'last_name'     => $validated['last_name'],
                'phone_number'  => $validated['phone_number'],
                'address'       => $validated['address'],
                'date_of_birth' => $validated['date_of_birth'],
                'nationality'   => $validated['nationality'],
            ];

            if ($isExisting) {
                // ── UPDATE ────────────────────────────────────────────────
                $borrower = Borrower::where('user_id', Auth::id())
                    ->with('identification')
                    ->firstOrFail();

                // Reset to pending so admin re-reviews the updated submission
                $borrower->update(array_merge($borrowerData, [
                    'account_status'   => 'pending',
                    'rejection_reason' => null,
                ]));

                $identificationData = [
                    'id_type'    => $validated['id_type'],
                    'id_number'  => $validated['id_number'],
                    'issue_date' => $validated['issue_date'],
                    'expiry_date' => $validated['expiry_date'],
                ];

                // Only replace the stored image if a new file was uploaded
                if ($request->hasFile('id_image')) {
                    // Delete old image if it exists
                    if ($borrower->identification?->image_path) {
                        Storage::disk('public')->delete($borrower->identification->image_path);
                    }
                    $identificationData['image_path'] = $request->file('id_image')
                        ->store('borrower-ids', 'public');
                }

                $borrower->identification()->updateOrCreate(
                    ['borrower_id' => $borrower->id],
                    $identificationData
                );

                // Replace all references
                $borrower->references()->delete();
                foreach ($validated['references'] as $ref) {
                    $borrower->references()->create($ref);
                }
            } else {
                // ── CREATE ────────────────────────────────────────────────
                $imagePath = $request->file('id_image')->store('borrower-ids', 'public');

                $borrower = Borrower::create(array_merge($borrowerData, [
                    'user_id'        => Auth::id(),
                    'account_status' => 'pending',
                ]));

                $borrower->identification()->create([
                    'id_type'    => $validated['id_type'],
                    'id_number'  => $validated['id_number'],
                    'issue_date' => $validated['issue_date'],
                    'expiry_date' => $validated['expiry_date'],
                    'image_path' => $imagePath,
                ]);

                foreach ($validated['references'] as $ref) {
                    $borrower->references()->create($ref);
                }

                BorrowerRegistered::dispatch($borrower);
            }
        });

        return redirect()->to('/user/profile');
    }
}
