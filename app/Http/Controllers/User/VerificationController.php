<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Borrower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VerificationController extends Controller
{
    public function index(Request $request)
    {
        $borrower = null;

        if ($request->filled('id')) {
            $borrower = Borrower::with(['references', 'identification'])
                ->where('user_id', $request->user()?->id)
                ->find($request->input('id'));

            if ($borrower?->identification?->image_path) {
                $borrower->identification->id_image_url = Storage::url(
                    $borrower->identification->image_path
                );
            }
        }

        return Inertia::render('User/Verification/Index', [
            'borrower' => $borrower,
        ]);
    }
}
