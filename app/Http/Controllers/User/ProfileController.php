<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreBorrowerProfileRequest;
use App\Models\Borrower;
use App\Services\BorrowerProfileService;
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

        if (! $borrower) {
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

    public function store(StoreBorrowerProfileRequest $request, BorrowerProfileService $profiles)
    {
        $profiles->submit(
            $request->user(),
            $request->validated(),
            $request->file('id_image')
        );

        return redirect()->to('/user/profile');
    }
}
