<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Borrower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $validated = $request->validate([
            'first_name'   => ['required', 'string', 'max:100'],
            'last_name'    => ['required', 'string', 'max:100'],
            'phone_number' => ['required', 'string', 'max:20'],
            'address'      => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:-18 years'],
            'nationality'   => ['required', 'string', 'max:100'],

            'id_type'   => ['required', 'string', 'max:100'],
            'id_number' => ['required', 'string', 'max:100'],
            'issue_date'  => ['required', 'date', 'before:today'],
            'expiry_date' => ['required', 'date', 'after:today'],
            'id_image'  => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:10240'],

            'references'                  => ['required', 'array', 'min:3'],
            'references.*.first_name'     => ['required', 'string', 'max:100'],
            'references.*.last_name'      => ['required', 'string', 'max:100'],
            'references.*.phone_number'   => ['required', 'string', 'max:20'],
            'references.*.address'        => ['required', 'string', 'max:255'],
            'references.*.relationship'   => ['required', 'string', 'max:100'],
        ], [
            'date_of_birth.before'  => 'You must be at least 18 years old.',
            'expiry_date.after'     => 'Your ID must not be expired.',
            'issue_date.before'     => 'Issue date must be in the past.',
            'references.min'        => 'Please provide at least 3 references.',
        ]);

        $imagePath = $request->file('id_image')->store('borrower-ids', 'public');

        $borrower = Borrower::create([
            'user_id'        => Auth::id(),
            'user_id'        => Auth::id(),
            'first_name'     => $validated['first_name'], 
            'last_name'      => $validated['last_name'],   
            'phone_number'   => $validated['phone_number'], 
            'address'        => $validated['address'],     
            'date_of_birth'  => $validated['date_of_birth'],
            'nationality'    => $validated['nationality'],
            'account_status' => 'pending',
        ]);

        $borrower->identification()->create([
            'id_type'     => $validated['id_type'],
            'id_number'   => $validated['id_number'],
            'issue_date'  => $validated['issue_date'],
            'expiry_date' => $validated['expiry_date'],
            'image_path'  => $imagePath,
        ]);

        foreach ($validated['references'] as $ref) {
            $borrower->references()->create([
                'first_name'   => $ref['first_name'],
                'last_name'    => $ref['last_name'],
                'phone_number' => $ref['phone_number'],
                'address'      => $ref['address'],
                'relationship' => $ref['relationship'],
            ]);
        }

        return redirect()->back()
            ->with('success', 'Verification submitted successfully.');
    }
}
